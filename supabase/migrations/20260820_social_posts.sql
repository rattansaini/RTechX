-- Post log + approval queue for the RTechX social automation.
--
-- In the `rtechx` schema, not `public`. This database also hosts an
-- unrelated Amazon reporting project in `public`; the site's tables were
-- deliberately separated from it, and this table belongs on the site's side.
-- The schema is already exposed to PostgREST and granted to service_role.

create table if not exists rtechx.social_posts (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  scheduled_for   date not null,
  format          text not null check (format in ('still','reel')),
  status          text not null check (status in (
                    'pending_approval','flagged_unsourced','approved',
                    'published','rejected','failed')),
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

-- Server-only table: all access goes through the service role key.
-- RLS on with zero policies denies everyone except service_role, which is
-- the same posture as the rest of the rtechx tables.
alter table rtechx.social_posts enable row level security;

-- Public storage bucket. Meta fetches media by URL, so objects must be
-- readable without auth and must return raw bytes (no redirects).
insert into storage.buckets (id, name, public)
values ('social-media', 'social-media', true)
on conflict (id) do nothing;
