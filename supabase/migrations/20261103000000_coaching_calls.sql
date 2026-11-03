-- Custom 1:1 Coaching — the ₹299 + GST discovery call.
--
-- One row per booking attempt. Written BEFORE Razorpay is called (same rule as
-- rtechx.orders: never take money we cannot reconcile), flipped to 'paid' by the
-- signature-verified callback or the payment.captured webhook, and enriched
-- with the Cal.com booking by /api/webhooks/cal.
--
-- Idempotent. Safe to run twice.

create table if not exists rtechx.coaching_calls (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  full_name           text not null,
  email               text not null,
  -- E.164, e.g. +919876543210
  mobile              text not null,
  -- Named `occupation`, not `current_role`: that is a reserved word in Postgres.
  occupation          text not null,
  tracks              text[] not null,
  goal                text not null,
  consent_at          timestamptz not null,

  -- ₹299 + 18% GST = 35282 paise. Integer paise, never float rupees.
  amount_paise        integer not null check (amount_paise = 35282),

  razorpay_order_id   text unique,
  razorpay_payment_id text unique,
  payment_status      text not null default 'created'
                      check (payment_status in ('created', 'paid', 'failed', 'refunded')),

  cal_booking_uid     text,
  call_start_at       timestamptz,
  call_status         text default 'not_booked'
                      check (call_status in ('not_booked', 'booked', 'cancelled', 'completed', 'no_show')),
  notes               text
);

create index if not exists coaching_calls_email_idx
  on rtechx.coaching_calls (lower(email), created_at desc);
create index if not exists coaching_calls_cal_uid_idx
  on rtechx.coaching_calls (cal_booking_uid);

-- RLS on, zero policies: the browser's publishable key can read nothing.
-- Only server code holding the service-role key touches this table.
alter table rtechx.coaching_calls enable row level security;

grant all privileges on rtechx.coaching_calls to service_role, postgres;
