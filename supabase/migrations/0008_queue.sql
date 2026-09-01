-- ============================================================
-- 0008_queue.sql
-- Module 5: Open Chat Queue — queue_entries + listener availability
-- Project: Our Ears Are Open
-- ============================================================

-- Add a 'queue' payment type so queue-join payments are auditable
-- separately from bookings and donations (enables refund-on-leave).
alter type public.payment_type add value if not exists 'queue';

-- Listener availability flag for the open queue (used for matching).
alter table public.profiles
  add column if not exists open_queue_enabled boolean not null default false;

-- SECURITY DEFINER helper: is the signed-in user a listener? Mirrors is_admin().
create or replace function public.is_listener()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'listener'
  );
$$;

revoke execute on function public.is_listener() from public, anon;
grant execute on function public.is_listener() to authenticated;

-- FIFO open-chat queue.
create type public.queue_status as enum (
  'waiting', 'assigned', 'connected', 'left', 'completed'
);

create table public.queue_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  payment_id uuid references public.payments (id) on delete set null,
  status public.queue_status not null default 'waiting',
  assigned_listener_id uuid references public.profiles (id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index queue_entries_status_idx on public.queue_entries (status, created_at);
create index queue_entries_user_idx on public.queue_entries (user_id);

create trigger set_queue_entries_updated_at
  before update on public.queue_entries
  for each row execute procedure public.handle_updated_at();

alter table public.queue_entries enable row level security;

-- Customers can read/update their own entry.
create policy "customer_read_own_queue"
  on public.queue_entries for select
  using (auth.uid() = user_id);

create policy "customer_update_own_queue"
  on public.queue_entries for update
  using (auth.uid() = user_id);

-- Listeners can read the waiting pool to see who is next / take a session.
create policy "listener_read_queue_pool"
  on public.queue_entries for select
  using (public.is_listener());

-- Admins + super admins manage everything.
create policy "admins_all_queue"
  on public.queue_entries for all
  using (public.is_admin())
  with check (public.is_admin());

-- Enable Realtime so customers get live position / assignment updates.
alter publication supabase_realtime add table public.queue_entries;
