-- ============================================================
-- 0001_auth_users.sql
-- Phase 1: Auth & Users — profiles table, roles, triggers, RLS
-- Project: Our Ears Are Open
-- ============================================================

-- Role enum for the platform
create type public.user_role as enum ('customer', 'listener', 'admin', 'super_admin');

-- Profiles table — one row per auth.users entry
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  pronouns text,
  age_range text,
  reason text,
  services_consent boolean default false,
  profile_complete boolean default false,
  assigned_listener_id uuid, -- FK to listener profile (self-reference), added later
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sync email + updated_at on profile update
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "users_read_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin + super_admin can read all profiles
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );
