-- ============================================================
-- 0020_booking_assignment.sql
-- Module 3 (follow-up): scheduled-booking listener assignment.
--
-- Context: `bookings.listener_id` existed but was never written by any code
-- path, so a booked session could never be opened by either party. This
-- migration adds the tracking + access-control pieces needed for listeners to
-- see and accept open booking requests.
-- ============================================================

-- When the listener took the booking (null while the request is open).
alter table public.bookings
  add column if not exists assigned_at timestamptz;

-- Idempotency for the reminder cron: skip windows already emailed.
alter table public.bookings
  add column if not exists reminder_sent_at timestamptz;

-- Open-request lookups (listener pool: listener_id is null, still upcoming)
-- and per-listener appointment lookups.
create index if not exists bookings_open_requests_idx
  on public.bookings (slot_start)
  where listener_id is null and status = 'confirmed';

create index if not exists bookings_listener_status_idx
  on public.bookings (listener_id, status);

-- Listeners may read *open* booking requests (confirmed, unassigned, future)
-- so they can review and accept them, mirroring the queue pool. The customer's
-- concern text is intentionally visible here — it is the matching brief.
drop policy if exists "listener_read_open_bookings" on public.bookings;
create policy "listener_read_open_bookings"
  on public.bookings for select
  using (
    listener_id is null
    and status = 'confirmed'
    and slot_start is not null
    and slot_start > now()
  );

-- Customers see who they are matched with once assigned.
drop policy if exists "customers_read_assigned_listener" on public.profiles;
create policy "customers_read_assigned_listener"
  on public.profiles for select
  using (
    id in (
      select listener_id from public.bookings
      where user_id = auth.uid() and listener_id is not null
    )
  );

-- Live updates for the listener pool so new requests appear without a refresh.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;
