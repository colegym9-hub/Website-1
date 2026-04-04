-- Nurture columns, events log, email templates, automation settings, booked timestamps

alter table public.leads add column if not exists nurture_step int not null default 0;
alter table public.leads add column if not exists next_nurture_at timestamptz;
alter table public.leads add column if not exists nurture_paused_at timestamptz;
alter table public.leads add column if not exists recycle_at timestamptz;
alter table public.leads add column if not exists call_booked_at timestamptz;
alter table public.leads add column if not exists shoot_booked_at timestamptz;

create index if not exists leads_next_nurture_at_idx on public.leads (next_nurture_at) where next_nurture_at is not null and unsubscribed_at is null;
create index if not exists leads_recycle_at_idx on public.leads (recycle_at) where recycle_at is not null and unsubscribed_at is null;

update public.leads set lead_stage = 'engaged_warm' where lead_stage = 'magnet_engaged';

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null,
  payload jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists lead_events_lead_id_created_idx on public.lead_events (lead_id, created_at desc);

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  template_key text not null,
  subject text not null default '',
  body_html text not null default '',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (service, template_key)
);

create table if not exists public.automation_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.automation_settings (key, value)
values ('global', '{"paused": false, "send_hour_et": 10}')
on conflict (key) do nothing;
