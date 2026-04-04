-- Run in Supabase SQL editor or via CLI. RLS on; no policies for anon — service role only.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null default '',
  org text not null default '',
  location text not null default '',
  service text not null default '',
  timeline text not null default '',
  package_name text not null default '',
  team_size int,
  detail_sport_program text not null default '',
  detail_session_style text not null default '',
  notes_extras text not null default '',
  raw_payload jsonb,
  lead_score int,
  lead_tier text,
  readiness text,
  psych_pick text,
  cta_variant text,
  lead_stage text not null default 'submitted',
  magnet_engaged_at timestamptz,
  unsubscribed_at timestamptz
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;
