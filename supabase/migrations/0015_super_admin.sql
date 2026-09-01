-- ============================================================
-- 0015_super_admin.sql
-- Module 10: Super Admin
--   is_super_admin() helper + org_config, feature_flags, audit_log.
-- Project: Our Ears Are Open
-- ============================================================

-- SECURITY DEFINER helper: true only for super_admins. Used to gate
-- RLS on super-admin-owned tables (org_config, feature_flags, audit_log).
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

revoke execute on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated;

-- ------------------------------------------------------------
-- org_config: single-row organisation + branding + crisis links.
-- Consumers read name/logo/crisis links (public SELECT); only
-- super_admins can change them.
-- ------------------------------------------------------------
create table public.org_config (
  id bigint primary key check (id = 1),
  org_name text not null default 'Our Ears Are Open',
  logo_url text,
  support_email text,
  timezone text not null default 'America/New_York',
  crisis_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.org_config enable row level security;

create policy "org_config_public_read"
  on public.org_config for select
  using (true);

create policy "org_config_super_admin_write"
  on public.org_config for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Seed the single config row.
insert into public.org_config (id, org_name, support_email, timezone, crisis_links)
values (
  1,
  'Our Ears Are Open',
  'support@ourearsareopen.com',
  'America/New_York',
  '[
    {"label":"988 Suicide & Crisis Lifeline","url":"https://988lifeline.org"},
    {"label":"Crisis Text Line","url":"https://www.crisistextline.org"}
  ]'::jsonb
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- feature_flags: platform-wide switches (open queue, donations,
-- free booking, scheduled phone). Super_admin toggles them.
-- ------------------------------------------------------------
create table public.feature_flags (
  key text primary key,
  enabled boolean not null default true,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.feature_flags enable row level security;

create policy "feature_flags_public_read"
  on public.feature_flags for select
  using (true);

create policy "feature_flags_super_admin_write"
  on public.feature_flags for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Seed default flags.
insert into public.feature_flags (key, enabled, description) values
  ('open_queue',     true,  'Allow consumers to join the open chat queue with a donation.'),
  ('donations',      true,  'Allow one-off donations on the donate page.'),
  ('free_booking',   true,  'Allow a free 15-minute booking option.'),
  ('scheduled_phone',true,  'Allow scheduled phone appointments (by appointment only).')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- audit_log: append-only trail of sensitive admin/super-admin
-- actions (role changes, deactivations, config/flag edits).
-- ------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on public.audit_log (created_at desc);
create index audit_log_action_idx on public.audit_log (action);

alter table public.audit_log enable row level security;

-- Only super_admins can read the audit log (append is done via the
-- service-role admin client which bypasses RLS).
create policy "audit_log_super_admin_read"
  on public.audit_log for select
  using (public.is_super_admin());
