-- RTechX Recruiter Toolkit — free 7-day access after email sign-in.
--
-- Deliberately stores no JDs, resumes or AI output. Only who signed in, when
-- their 7 days run out, and a count of runs per tool (for the daily limit).
--
-- Idempotent. Safe to run twice.

create table if not exists rtechx.tool_users (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  email             text not null unique,
  consent_at        timestamptz not null,
  trial_started_at  timestamptz not null default now(),
  trial_ends_at     timestamptz not null,
  -- Set by Rattan by hand to extend access (students, coachees).
  access_until      timestamptz,
  last_seen_at      timestamptz
);

create table if not exists rtechx.tool_login_codes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  -- sha256(code + ':' + email). The code itself is never stored.
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    integer not null default 0,
  used_at     timestamptz
);
create index if not exists tool_login_codes_email_idx
  on rtechx.tool_login_codes (email, created_at desc);

create table if not exists rtechx.tool_usage (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid not null references rtechx.tool_users (id) on delete cascade,
  tool        text not null,
  units       integer not null default 1
);
create index if not exists tool_usage_user_idx
  on rtechx.tool_usage (user_id, created_at desc);

-- RLS on, zero policies: only server code with the service-role key.
alter table rtechx.tool_users       enable row level security;
alter table rtechx.tool_login_codes enable row level security;
alter table rtechx.tool_usage       enable row level security;

grant all privileges on rtechx.tool_users, rtechx.tool_login_codes, rtechx.tool_usage
  to service_role, postgres;
grant usage, select on all sequences in schema rtechx to service_role, postgres;
