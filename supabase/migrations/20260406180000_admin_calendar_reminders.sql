-- Date-only next nurture (calendar), completed flag, reminder dismissals (archive)

alter table public.leads add column if not exists next_nurture_on date;
alter table public.leads add column if not exists completed_at timestamptz;

update public.leads
set next_nurture_on = (next_nurture_at at time zone 'utc')::date
where next_nurture_at is not null
  and next_nurture_on is null;

create table if not exists public.admin_reminder_dismissals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  reminder_key text not null,
  created_at timestamptz not null default now(),
  unique (lead_id, reminder_key)
);

create index if not exists admin_reminder_dismissals_lead_id_idx on public.admin_reminder_dismissals (lead_id);
