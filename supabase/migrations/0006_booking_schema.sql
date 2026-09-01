-- ============================================================
-- 0006_booking_schema.sql
-- Module 3: Booking — bookings + availability_slots tables, RLS.
-- Project: Our Ears Are Open
-- ============================================================

-- Booking lifecycle: pending -> confirmed (on payment) -> completed /
-- no_show; or pending -> cancelled.
create type public.booking_status as enum (
  'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create type public.book_type as enum ('phone', 'chat');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listener_id uuid references public.profiles (id) on delete set null,
  type public.book_type not null,
  payment_option text not null default 'paid', -- 'paid' | 'free'
  concern text,
  preferences jsonb not null default '{}'::jsonb,
  slot_start timestamptz,
  slot_end timestamptz,
  status public.booking_status not null default 'pending',
  payment_intent_id text, -- set in Module 4 (Stripe)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_payment_option_check
    check (payment_option in ('paid', 'free'))
);

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

alter table public.bookings enable row level security;

-- Customers can read/create/update their own bookings.
create policy "customer_read_own_bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "customer_insert_own_bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "customer_update_own_bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Assigned listener can read + update the booking they are assigned to.
create policy "listener_read_assigned_bookings"
  on public.bookings for select
  using (auth.uid() = listener_id);

create policy "listener_update_assigned_bookings"
  on public.bookings for update
  using (auth.uid() = listener_id);

-- Admins + super admins manage everything (non-recursive helper).
create policy "admins_all_bookings"
  on public.bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- availability_slots: a listener's offered time windows.
create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  listener_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  booking_id uuid references public.bookings (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint availability_slots_time_check check (ends_at > starts_at)
);

alter table public.availability_slots enable row level security;

-- Any authenticated user may read availability (to book).
create policy "anyone_read_availability"
  on public.availability_slots for select
  using (auth.role() = 'authenticated');

-- Listeners manage their own slots.
create policy "listener_manage_own_slots"
  on public.availability_slots for all
  using (auth.uid() = listener_id)
  with check (auth.uid() = listener_id);

-- Admins manage all slots.
create policy "admins_all_slots"
  on public.availability_slots for all
  using (public.is_admin())
  with check (public.is_admin());
