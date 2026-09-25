-- RTechX: the whole database, from nothing.
--
-- WHY THIS FILE EXISTS
--
-- It did not, until September 2026, and that turned out to matter. The schema
-- had only ever been created by running statements against a live project, so
-- the single copy of it was inside that project. When Supabase paused the
-- project — free plan, three projects, two allowed — the structure became
-- unreadable along with the data, and the checkout started returning 500 to
-- every buyer. There was no way to stand it up elsewhere without reading the
-- application code and inferring what the tables must have looked like.
--
-- That is exactly what this file is: reconstructed from the code that reads and
-- writes these tables, then committed, so the database can be rebuilt anywhere
-- in one command and is never again something only a hosting provider holds.
--
-- Run it against a fresh project:
--   psql "$DATABASE_URL" -f supabase/migrations/00000000000000_rtechx_schema.sql
--
-- It is idempotent. Running it twice changes nothing the second time.

-- ---------------------------------------------------------------------------
-- Schema
--
-- Not `public`. This project has historically shared a database with unrelated
-- applications that own their own `orders` table, and a collision there would
-- be silent and awful. Everything RTechX owns lives under one name that can be
-- extracted later with a single `pg_dump -n rtechx`.
-- ---------------------------------------------------------------------------
create schema if not exists rtechx;

-- ---------------------------------------------------------------------------
-- Leads — captured before payment is attempted
--
-- Written at two moments: the free-resource form, and the start of checkout.
-- The second is the point of it. If someone fills in the checkout form and
-- then abandons the payment, we still have somebody to follow up with, and
-- that row is worth more than the abandoned order.
-- ---------------------------------------------------------------------------
create table if not exists rtechx.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  email        text not null,
  name         text,
  phone        text,
  -- Which form this came from: 'boolean-cheatsheet', 'checkout', 'contact'…
  source       text not null,
  course_slug  text,
  -- utm_source, utm_campaign, fbclid and friends, carried from the landing page.
  attribution  jsonb not null default '{}'::jsonb
);

-- The application upserts with `onConflict: "email,source"`, which requires a
-- real unique constraint on exactly those two columns in that order.
--
-- This was once an expression index on `(lower(email), source)`. Postgres
-- could not match the upsert to it, every insert failed with 42P10, the error
-- was swallowed by design because a failed lead must never break checkout —
-- and so every single lead was lost silently for days. A plain constraint is
-- matchable; the application lowercases the address before writing instead.
create unique index if not exists leads_email_source_key
  on rtechx.leads (email, source);

create index if not exists leads_created_at_idx
  on rtechx.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- Orders — one row per attempt to pay, created before Razorpay is called
--
-- The row exists before the customer is charged, deliberately. Without it
-- there is no way to verify the payment afterwards, so `create-order` refuses
-- to continue if this insert fails rather than take money it cannot reconcile.
-- ---------------------------------------------------------------------------
create table if not exists rtechx.orders (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  razorpay_order_id   text not null,
  razorpay_payment_id text,

  status              text not null default 'created'
                      check (status in ('created', 'paid', 'failed')),

  course_slug         text not null,
  tier_id             text not null,
  is_upgrade          boolean not null default false,

  -- Paise, as an integer, matching Razorpay exactly. Never rupees as a float:
  -- money in a floating-point column is a rounding error waiting for a
  -- reconciliation that does not balance.
  amount_paise        integer not null check (amount_paise >= 100),
  currency            text not null default 'INR',
  coupon_code         text,

  buyer_name          text not null,
  buyer_email         text not null,
  buyer_phone         text not null,
  buyer_city          text,
  buyer_status        text,

  attribution         jsonb not null default '{}'::jsonb
);

-- Razorpay's id is the join key between us and them, and the webhook and the
-- browser callback both look an order up by it. It must be unique.
create unique index if not exists orders_razorpay_order_id_key
  on rtechx.orders (razorpay_order_id);

create index if not exists orders_status_idx     on rtechx.orders (status);
create index if not exists orders_created_at_idx on rtechx.orders (created_at desc);
create index if not exists orders_buyer_email_idx on rtechx.orders (buyer_email);

-- ---------------------------------------------------------------------------
-- Enrolments — created only after a payment signature verifies
-- ---------------------------------------------------------------------------
create table if not exists rtechx.enrollments (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),

  order_id         uuid not null references rtechx.orders (id) on delete restrict,

  email            text not null,
  name             text not null,
  phone            text,
  course_slug      text not null,
  tier_id          text not null,
  batch_start_date date not null,

  status           text not null default 'confirmed'
                   check (status in ('confirmed', 'cancelled', 'refunded'))
);

-- The idempotency guarantee, and the reason a student is never enrolled twice.
--
-- Two things report a successful payment: the browser callback and Razorpay's
-- server-to-server webhook. Both fire for most purchases, both call the same
-- fulfilment code, and the second one to arrive tries to insert a row that
-- already exists. This constraint turns that race into a duplicate-key error
-- the code recognises and ignores, instead of a second enrolment and a second
-- confirmation email. It is load-bearing — do not drop it.
create unique index if not exists enrollments_order_id_key
  on rtechx.enrollments (order_id);

create index if not exists enrollments_batch_idx
  on rtechx.enrollments (course_slug, batch_start_date);

-- ---------------------------------------------------------------------------
-- Coupons
--
-- Every rule is enforced server-side when a code is redeemed — expiry, the
-- redemption cap, which tier it applies to. The browser only ever sends the
-- code itself; it never sends a price.
-- ---------------------------------------------------------------------------
create table if not exists rtechx.coupons (
  code             text primary key,
  created_at       timestamptz not null default now(),
  discount_type    text not null check (discount_type in ('percent', 'flat')),
  discount_value   numeric not null check (discount_value > 0),
  active           boolean not null default true,
  max_redemptions  integer,
  redeemed_count   integer not null default 0,
  expires_at       timestamptz,
  -- null means it applies to every tier.
  applies_to_tier  text
);

-- ---------------------------------------------------------------------------
-- Social posts — the approval queue for the daily automation
-- ---------------------------------------------------------------------------
create table if not exists rtechx.social_posts (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  scheduled_for   date not null,
  format          text not null check (format in ('still', 'reel')),
  status          text not null check (status in (
                    'pending_approval', 'flagged_unsourced', 'approved',
                    'published', 'rejected', 'failed')),
  content         jsonb not null,
  media_url       text,
  ig_creation_id  text,
  ig_post_id      text,
  fb_post_id      text,
  error           text
);

create index if not exists social_posts_scheduled_for_idx
  on rtechx.social_posts (scheduled_for desc);
create index if not exists social_posts_status_idx
  on rtechx.social_posts (status);

-- ---------------------------------------------------------------------------
-- How full is each batch
--
-- Counts confirmed enrolments, not paid orders — a refunded seat is free
-- again. Nothing on the website reads this yet; the seat counter renders
-- nothing rather than guess. It exists so that when a real number is wanted,
-- it comes from the enrolments themselves and not from someone's memory.
-- ---------------------------------------------------------------------------
create or replace view rtechx.batch_seats as
  select course_slug,
         batch_start_date,
         count(*) filter (where status = 'confirmed') as seats_taken
    from rtechx.enrollments
   group by course_slug, batch_start_date;

-- ---------------------------------------------------------------------------
-- Row-level security: on everywhere, with no policies anywhere
--
-- RLS with zero policies denies everyone. The only key that gets past it is
-- the service role, which bypasses RLS entirely and lives server-side only.
-- So the publishable key shipped to every browser can read nothing here — not
-- a lead, not an order, not a buyer's phone number.
--
-- If you ever add a policy to one of these tables, you are opening it to the
-- browser. Be certain that is what you intend.
-- ---------------------------------------------------------------------------
alter table rtechx.leads        enable row level security;
alter table rtechx.orders       enable row level security;
alter table rtechx.enrollments  enable row level security;
alter table rtechx.coupons      enable row level security;
alter table rtechx.social_posts enable row level security;

-- ---------------------------------------------------------------------------
-- Grants
--
-- Creating the tables is not enough: without these the service role gets
-- "permission denied for schema rtechx" and every write fails with a 403 that
-- looks like a key problem and is not. This cost an evening the first time.
-- ---------------------------------------------------------------------------
grant usage on schema rtechx to service_role, postgres;
grant all privileges on all tables    in schema rtechx to service_role, postgres;
grant all privileges on all sequences in schema rtechx to service_role, postgres;

alter default privileges in schema rtechx
  grant all privileges on tables to service_role, postgres;
alter default privileges in schema rtechx
  grant all privileges on sequences to service_role, postgres;

-- ---------------------------------------------------------------------------
-- Expose the schema to PostgREST
--
-- Supabase's client talks to PostgREST, which only serves schemas it has been
-- told about. A schema that exists, has tables, and has grants will still
-- return 404 for everything until it appears in this list — another failure
-- that reads like a broken key.
--
-- This can also be set in the dashboard under Settings → API → Exposed
-- schemas. Doing it here means a rebuild does not depend on remembering to.
-- ---------------------------------------------------------------------------
alter role authenticator
  set pgrst.db_schemas = 'public, storage, graphql_public, rtechx';

notify pgrst, 'reload config';

-- ---------------------------------------------------------------------------
-- Storage for generated social images
--
-- Public on purpose. Meta fetches media by URL from its own servers and will
-- not authenticate, follow a redirect, or parse an HTML wrapper — it needs a
-- URL that returns raw image bytes. A private bucket here fails every post,
-- and fails it quietly.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('social-media', 'social-media', true)
on conflict (id) do nothing;
