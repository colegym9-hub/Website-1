-- Safe to run on existing projects: adds columns the booking API expects if an older `leads` table exists.
-- Run after `20250403120000_leads.sql` (or any version that already created `public.leads`).

alter table public.leads add column if not exists phone text not null default '';
alter table public.leads add column if not exists org text not null default '';
alter table public.leads add column if not exists location text not null default '';
alter table public.leads add column if not exists service text not null default '';
alter table public.leads add column if not exists timeline text not null default '';
alter table public.leads add column if not exists package_name text not null default '';
alter table public.leads add column if not exists team_size int;
alter table public.leads add column if not exists detail_sport_program text not null default '';
alter table public.leads add column if not exists detail_session_style text not null default '';
alter table public.leads add column if not exists notes_extras text not null default '';
alter table public.leads add column if not exists raw_payload jsonb;
alter table public.leads add column if not exists lead_score int;
alter table public.leads add column if not exists lead_tier text;
alter table public.leads add column if not exists readiness text;
alter table public.leads add column if not exists psych_pick text;
alter table public.leads add column if not exists cta_variant text;
alter table public.leads add column if not exists lead_stage text not null default 'submitted';
alter table public.leads add column if not exists magnet_engaged_at timestamptz;
alter table public.leads add column if not exists unsubscribed_at timestamptz;
