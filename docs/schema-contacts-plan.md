# Schema replacement plan: leads → contacts + shoots + ...

Status: design doc. No migration applied. Review this, decide, then I (or you) write the real migration files in `supabase/migrations/`.

## Why this exists

The Phase 1 spec (2026-04-20) reframes the business around warm relationships: coaches, parents, referrals, repeat clients. The existing `leads` table was built for a cold-funnel model: score strangers, stage them through nurture sends, recycle the cold ones. Under the new spec, ~2/3 of that table's columns are dead weight.

The new data model centers on a stable `contacts` table (the relationship ledger) with `shoots` hanging off it (one row per job). The current /book funnel keeps collecting all the rich fields; they just land in different tables going forward.

## Phase 1 tables

All six tables from the spec, as `CREATE TABLE` statements ready to drop into a migration file. `uuid_generate_v4` not used — following the repo's current convention of `gen_random_uuid()`.

```sql
-- ─── contacts ─────────────────────────────────────────────────────────────────
-- The relationship ledger. One row per real person Cole does business with.
-- Coaches, parents, organizers, athletes, seniors, referrers. Stable forever.

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  role text,                         -- 'coach' | 'parent' | 'organizer' | 'athlete' | 'senior' | 'other'
  phone text,
  email text,
  ig_handle text,
  fb_handle text,

  how_cole_knows_them text,          -- free text, e.g. "met at TLLL 2024 media day"
  introduced_by uuid references public.contacts(id) on delete set null,

  first_shoot_at timestamptz,        -- backfilled from earliest shoots.scheduled_at
  last_touch_at timestamptz,         -- latest of: shoot booking, message, email event
  shoot_count int not null default 0,
  lifetime_revenue_cents bigint not null default 0,

  notes text
);

create index if not exists contacts_email_idx on public.contacts (lower(email)) where email is not null;
create index if not exists contacts_phone_idx on public.contacts (phone) where phone is not null;
create index if not exists contacts_introduced_by_idx on public.contacts (introduced_by) where introduced_by is not null;
create index if not exists contacts_last_touch_idx on public.contacts (last_touch_at desc);
create unique index if not exists contacts_email_unique on public.contacts (lower(email)) where email is not null;

alter table public.contacts enable row level security;


-- ─── shoots ───────────────────────────────────────────────────────────────────
-- One row per shoot. Tied to the organizing contact.
-- Lifecycle: inquiry → booked → in_progress → delivered → closed.

create table if not exists public.shoots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  slug text not null unique,                     -- e.g. 'williamson-prom-2026'; drives /s/[slug]
  contact_id uuid not null references public.contacts(id) on delete restrict,

  shoot_type text not null,                      -- 'media-day' | 'sportraits' | 'senior-portraits'
  display_name text not null,                    -- e.g. 'Williamson Prom 2026'
  status text not null default 'inquiry',        -- 'inquiry' | 'booked' | 'in_progress' | 'delivered' | 'closed'

  scheduled_at timestamptz,
  location text,
  team_name text,                                -- free text: 'TLLL Baseball', 'CV Wrestling', etc.
  package_name text,
  roster_size int,

  deposit_cents int,
  total_cents int,
  gallery_url text,                              -- Pixieset link
  delivered_at timestamptz,
  closed_at timestamptz,

  notes text
);

create index if not exists shoots_contact_id_idx on public.shoots (contact_id);
create index if not exists shoots_status_idx on public.shoots (status);
create index if not exists shoots_scheduled_at_idx on public.shoots (scheduled_at) where scheduled_at is not null;

alter table public.shoots enable row level security;


-- ─── shoot_forms ──────────────────────────────────────────────────────────────
-- Progressive intake responses. One row per form submission per shoot.
-- Designed so repeat jobs for the same client don't collide with old answers.
-- Stores the rich fields the /book funnel currently collects (readiness, vibes,
-- session style, sport details, etc.) AND the per-shoot intake later (senior
-- portrait location picker, media day pose list, etc.).

create table if not exists public.shoot_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  shoot_id uuid not null references public.shoots(id) on delete cascade,
  form_key text not null,                        -- 'booking' | 'senior-intake' | 'md-logistics' | etc.
  payload jsonb not null default '{}',           -- shape varies by form_key

  submitted_at timestamptz,
  unique (shoot_id, form_key)
);

create index if not exists shoot_forms_shoot_id_idx on public.shoot_forms (shoot_id);

alter table public.shoot_forms enable row level security;


-- ─── messages ─────────────────────────────────────────────────────────────────
-- Unified inbox. IG DM + FB Messenger + email + SMS, matched to a contact
-- where possible. Unknown senders get contact_id NULL for manual linking.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),

  channel text not null,                         -- 'email' | 'sms' | 'ig_dm' | 'fb_messenger'
  direction text not null,                       -- 'inbound' | 'outbound'
  contact_id uuid references public.contacts(id) on delete set null,
  shoot_id uuid references public.shoots(id) on delete set null,

  external_id text,                              -- provider message id (Resend, Twilio, Meta)
  from_handle text,                              -- raw sender identifier
  to_handle text,
  subject text,
  body text,
  attachments jsonb default '[]',

  read_at timestamptz,
  replied_at timestamptz
);

create index if not exists messages_contact_id_idx on public.messages (contact_id, received_at desc);
create index if not exists messages_shoot_id_idx on public.messages (shoot_id, received_at desc);
create index if not exists messages_unlinked_idx on public.messages (received_at desc) where contact_id is null;
create index if not exists messages_channel_external_idx on public.messages (channel, external_id) where external_id is not null;

alter table public.messages enable row level security;


-- ─── payments ─────────────────────────────────────────────────────────────────
-- Stripe records. Spec says Stripe is aspirational (89.7% currently check/cash).
-- Schema supports both: stripe_* columns nullable, method column covers
-- 'stripe' | 'check' | 'cash' | 'other' so historical payments can be entered.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  shoot_id uuid not null references public.shoots(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,

  method text not null,                          -- 'stripe' | 'check' | 'cash' | 'other'
  amount_cents int not null,
  currency text not null default 'usd',
  kind text not null default 'payment',          -- 'deposit' | 'payment' | 'refund'
  status text not null default 'succeeded',      -- 'pending' | 'succeeded' | 'failed' | 'refunded'

  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_customer_id text,
  check_number text,                             -- optional, for physical check tracking

  received_at timestamptz,
  notes text
);

create index if not exists payments_shoot_id_idx on public.payments (shoot_id);
create index if not exists payments_contact_id_idx on public.payments (contact_id);
create index if not exists payments_stripe_pi_idx on public.payments (stripe_payment_intent_id) where stripe_payment_intent_id is not null;

alter table public.payments enable row level security;


-- ─── email_events ─────────────────────────────────────────────────────────────
-- Resend webhook log + lifecycle email dispatch log. Powers the warm-contact
-- automation triggers (booking confirmation, pre-shoot, gallery-ready, etc.)
-- and the shoot-lifecycle-driven sends. NOT a generic event log — specifically
-- email-related, because other events (views, clicks on portal links) belong
-- on the shoot or contact row directly.

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),

  contact_id uuid references public.contacts(id) on delete set null,
  shoot_id uuid references public.shoots(id) on delete set null,

  trigger text not null,                         -- 'booking_confirm' | 'pre_shoot_logistics' | 'gallery_ready' | 'post_shoot_thank_you' | 'referral_ask' | 'connector_thank_you' | 'quiet_nudge'
  direction text not null default 'outbound',    -- 'outbound' | 'inbound_event'

  resend_id text,                                -- Resend message id
  event_type text,                               -- 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
  subject text,
  to_handle text,

  payload jsonb default '{}'                     -- raw Resend webhook body or send context
);

create index if not exists email_events_contact_id_idx on public.email_events (contact_id, occurred_at desc);
create index if not exists email_events_shoot_id_idx on public.email_events (shoot_id, occurred_at desc);
create index if not exists email_events_trigger_idx on public.email_events (trigger, occurred_at desc);
create index if not exists email_events_resend_idx on public.email_events (resend_id) where resend_id is not null;

alter table public.email_events enable row level security;
```

## Field-by-field mapping: current `leads` → new schema

The current /book funnel (and `/api/book`) collects ~24 fields. Under the new model, each field either: moves to a new table, gets collapsed into a JSON payload, or gets dropped because it was cold-funnel artifact.

| `leads.*`             | Goes to                                   | Notes                                                                 |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `id`                  | drop                                      | new schema has its own ids                                            |
| `created_at`          | `contacts.created_at` (oldest per email)  | first contact timestamp                                               |
| `name`                | `contacts.name`                           |                                                                       |
| `email`               | `contacts.email` (unique)                 | collapse duplicates by email                                          |
| `phone`               | `contacts.phone`                          |                                                                       |
| `org`                 | `shoots.team_name`                        | the team/org is shoot-scoped, not contact-scoped                      |
| `location`            | `shoots.location`                         |                                                                       |
| `service`             | `shoots.shoot_type`                       | direct rename                                                         |
| `timeline`            | `shoots.scheduled_at` (best-effort parse) | or keep as text in shoot_forms.payload if unparseable                 |
| `package_name`        | `shoots.package_name`                     |                                                                       |
| `team_size`           | `shoots.roster_size`                      |                                                                       |
| `detail_sport_program`| `shoot_forms.payload.sport`               | booking form payload                                                  |
| `detail_session_style`| `shoot_forms.payload.session_style`       | senior portrait style                                                 |
| `notes_extras`        | `shoot_forms.payload.notes`               |                                                                       |
| `raw_payload`         | `shoot_forms.payload` (full funnel state) | keep the whole form as-submitted                                      |
| `readiness`           | `shoot_forms.payload.readiness`           | no longer gates nurture; just context for Cole                        |
| `psych_pick`          | `shoot_forms.payload.psych_pick`          | same; keep the data, drop the behavior                                |
| `lead_score`          | **drop**                                  | cold-funnel scoring is cut                                            |
| `lead_tier`           | **drop**                                  | cold-funnel classification is cut                                     |
| `cta_variant`         | **drop**                                  | cold-funnel variant testing is cut                                    |
| `lead_stage`          | `shoots.status`                           | but with new vocabulary: inquiry/booked/in_progress/delivered/closed  |
| `magnet_engaged_at`   | `email_events` (one row, trigger='magnet')| keep as email-event history                                           |
| `unsubscribed_at`     | `contacts.notes` flag or drop             | if zero or tiny volume, drop; otherwise add `contacts.unsubscribed_at` |
| `nurture_step`        | **drop**                                  | cold-warming sequence is cut                                          |
| `next_nurture_at`     | **drop**                                  | cold-warming sequence is cut                                          |
| `nurture_paused_at`   | **drop**                                  | cold-warming sequence is cut                                          |
| `recycle_at`          | **drop**                                  | recycled-cold-lead pool is cut                                        |
| `call_booked_at`      | `shoots` — set status='booked' with scheduled_at |                                                                |
| `shoot_booked_at`     | `shoots` — set status='booked'            |                                                                       |
| `next_nurture_on`     | **drop**                                  | calendar reminder, cold-funnel                                        |
| `completed_at`        | `shoots.closed_at`                        |                                                                       |

The /book funnel's submission payload does NOT need to change during this migration. `/api/book` can keep writing to `leads` until the new tables are live, then switch its insert target to `contacts` + `shoots` + `shoot_forms` in one deploy. The richer fields (role, sport, roster, frame pick, package intent, vibe, session style, readiness, etc.) flow into `shoot_forms.payload` verbatim.

## Migration sequence

Run in order. Each step is its own migration file. Between B and D, `/api/book` still writes to `leads` — that's intentional, keeps the public flow live during the cutover.

**A. Create new tables.** (`20260420120000_phase1_tables.sql`)
- Run the six `CREATE TABLE` statements above.
- No data modification.

**B. Backfill `contacts` from `leads`.** (`20260420130000_backfill_contacts.sql`)
```sql
insert into public.contacts (name, email, phone, role, created_at, last_touch_at)
select
  min(name) as name,
  lower(email) as email,
  max(phone) as phone,
  null as role,
  min(created_at) as created_at,
  max(created_at) as last_touch_at
from public.leads
where email is not null and email <> ''
group by lower(email);
```
- Collapses duplicate emails to one contact. Keeps earliest name/timestamp, latest phone.
- `role` stays null — you fill it in manually or infer later.

**C. Create `shoots` retroactively from `leads` with `shoot_booked_at`.** (`20260420140000_backfill_shoots.sql`)
```sql
insert into public.shoots (contact_id, slug, shoot_type, display_name, status,
                            scheduled_at, location, team_name, package_name,
                            roster_size, created_at)
select
  c.id,
  -- slug: shoot_type + org + year. You'll want to hand-edit collisions.
  lower(regexp_replace(coalesce(l.service, 'shoot') || '-' ||
                       coalesce(nullif(l.org, ''), split_part(l.email, '@', 1)) || '-' ||
                       to_char(l.shoot_booked_at, 'YYYY'),
                       '[^a-z0-9-]+', '-', 'g')) as slug,
  l.service,
  coalesce(nullif(l.org, ''), l.name) as display_name,
  'booked' as status,
  l.shoot_booked_at,
  nullif(l.location, ''),
  nullif(l.org, ''),
  nullif(l.package_name, ''),
  l.team_size,
  l.created_at
from public.leads l
join public.contacts c on lower(c.email) = lower(l.email)
where l.shoot_booked_at is not null;
```
- Slugs will collide for repeat bookings by the same org. Manual fixup pass after.

**D. Populate `shoot_forms` with the full funnel payload.** (`20260420150000_backfill_shoot_forms.sql`)
```sql
insert into public.shoot_forms (shoot_id, form_key, payload, submitted_at)
select
  s.id,
  'booking' as form_key,
  coalesce(l.raw_payload, to_jsonb(l.*) - 'raw_payload') as payload,
  l.created_at
from public.leads l
join public.shoots s on s.contact_id = (select id from public.contacts where lower(email) = lower(l.email))
                    and s.created_at = l.created_at;
```
- Also insert `shoot_forms` rows for leads WITHOUT `shoot_booked_at`, once you decide whether to create placeholder `status='inquiry'` shoots for them or drop the data. Recommended: create placeholder inquiry-status shoots so no history is lost.

**E. Drop cold-funnel columns from `leads`.** (`20260420160000_drop_leads_cold_cols.sql`)
```sql
alter table public.leads drop column if exists lead_score;
alter table public.leads drop column if exists lead_tier;
alter table public.leads drop column if exists cta_variant;
alter table public.leads drop column if exists nurture_step;
alter table public.leads drop column if exists next_nurture_at;
alter table public.leads drop column if exists nurture_paused_at;
alter table public.leads drop column if exists recycle_at;
alter table public.leads drop column if exists next_nurture_on;
alter table public.leads drop column if exists magnet_engaged_at;
alter table public.leads drop column if exists psych_pick;

drop table if exists public.admin_reminder_dismissals;
drop table if exists public.automation_settings;
drop table if exists public.email_templates;   -- redefine later if you want DB-backed transactional templates
drop table if exists public.lead_events;
```
- `email_templates` may come back later for transactional email CMS. Drop for now to kill the nurture-era churn.

**F. Drop `leads` entirely.** (`20260420170000_drop_leads.sql`)
```sql
drop table if exists public.leads;
```
- Run after `/api/book` has been pointed at the new tables and at least one test booking confirms end-to-end. Separate session, separate deploy.

## RLS sketch

All six new tables have `enable row level security` above. No `create policy` statements yet — Phase 1 runs entirely through the service role (admin API routes and the public /api/book endpoint both use `createSupabaseAdmin` which bypasses RLS). Policies to add later when the client portal ships:

```sql
-- Clients see their own contact + shoots + shoot_forms + messages + payments.
-- Requires auth; client_user_id column on contacts first.
create policy contacts_self_read on public.contacts
  for select using (auth.uid() = client_user_id);

create policy shoots_client_read on public.shoots
  for select using (contact_id in (select id from public.contacts where client_user_id = auth.uid()));

-- etc.
```

Add `client_user_id uuid references auth.users(id)` to `contacts` when the portal ships.

## Dead-code punch list

Files that become dead once Phase 1 is live. Order is my suggested deletion sequence; each is a separate PR so blast-radius stays small.

**Round 1 — lib nurture core (after migration F):**
- `lib/nurture-schedule.ts`
- `lib/nurture-send-one.ts`
- `lib/run-nurture-automation.ts`
- `lib/recycle-send-one.ts`
- `lib/warm-tier-email-seeds.ts`
- `lib/follow-up-gate.ts`
- `lib/lead-score.ts`
- `lib/lead-stages.ts`
- `lib/lead-events.ts`
- `lib/automation.ts`

**Round 2 — admin pages (after migration F, once you've decided what the new admin looks like):**
- `app/admin/(secure)/leads/` (entire directory)
- `app/admin/(secure)/nurture-queue/`
- `app/admin/(secure)/calendar/`
- `app/admin/(secure)/settings/`
- `app/admin/(secure)/summary/`

**Round 3 — maybe keep, maybe rewrite:**
- `app/admin/(secure)/templates/` — email template editor. Probably useful for the new transactional sends, but schema will differ.
- `lib/nurture-mail.ts`, `lib/plain-email-compile.ts` — email composition. Keep the rendering pipeline, rewire to Phase 1 triggers.
- `lib/email-template-db.ts`, `lib/email-template-catalog.ts` — only if you keep DB-backed templates.

**Round 4 — cron routes:**
- `app/api/cron/nurture/` — delete.
- `app/api/admin/nurture-force/` — delete.

**Round 5 — `/book` itself:**
- You already 404'd `app/(no-nav)/book/page.tsx` in your WIP. `components/book/funnel.tsx` (just rewrote the copy in it) stays intact — when /book is restored, it's ready. If you've decided /contact fully replaces /book under the new model, `components/book/funnel.tsx` becomes dead code and can be deleted, along with the `components/book/` directory and the legacy `/api/book` route once you're sure no schedule-link emails still point at it.

## What this plan intentionally does NOT decide

- Whether /book and its rich funnel come back, or /contact replaces it permanently. The new spec says "minimal booking form" which argues for /contact; your instruction to me ("keep it a flow, just tightened, move the richer fields to the backend system later") argues for restoring /book. Decide before Phase 1 implementation starts.
- Whether `client_user_id` on `contacts` gets added in Phase 1 or Phase 2 (portal). Spec puts the portal in Phase 3 of the build order. I'd add the column as a nullable field in Phase 1 so it's ready without a future migration, but I didn't include it above because the spec doesn't have it.
- The exact schema for the unified inbox (messages table) around threading. Most channels don't thread cleanly. I modeled single messages; if you want threading, add a `thread_id` column + a `threads` table.
- How the iPad shoot-day tool's pose-card data lives. Not in scope for Phase 1 schema; will need its own tables.
