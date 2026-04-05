-- Idempotent: safe if 20260206120000_nurture_lead_events_admin.sql already ran.
-- Run in Supabase SQL Editor if your app errors on missing nurture_step.

alter table public.leads add column if not exists nurture_step int not null default 0;
alter table public.leads add column if not exists next_nurture_at timestamptz;
alter table public.leads add column if not exists nurture_paused_at timestamptz;
alter table public.leads add column if not exists recycle_at timestamptz;
alter table public.leads add column if not exists call_booked_at timestamptz;
alter table public.leads add column if not exists shoot_booked_at timestamptz;

create index if not exists leads_next_nurture_at_idx on public.leads (next_nurture_at) where next_nurture_at is not null and unsubscribed_at is null;
create index if not exists leads_recycle_at_idx on public.leads (recycle_at) where recycle_at is not null and unsubscribed_at is null;
