-- Plain-text email source (compiled to HTML at send/preview time)
alter table public.email_templates
  add column if not exists body_plain text not null default '';

comment on column public.email_templates.body_plain is 'Authoring format: plain text with [[merge:key]], [[link:label|url]], [[button:label|url]]. Empty means fall back to body_html or code defaults.';
