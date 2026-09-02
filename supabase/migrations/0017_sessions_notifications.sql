-- ============================================================
-- 0017_sessions_notifications.sql
-- Unblocked Module 7/8/11 work:
--   sessions.end_reason  (safety disconnect / no-show reason)
--   notifications table  (lean in-app notification center)
-- Project: Our Ears Are Open
-- ============================================================

-- ------------------------------------------------------------
-- sessions.end_reason: why a session ended (safety disconnect,
-- no-show, etc.). Free text, set by the ending participant.
-- ------------------------------------------------------------
alter table public.sessions
  add column if not exists end_reason text;

-- ------------------------------------------------------------
-- notifications: in-app notification center.
-- Rows are created from server-side API routes (service role);
-- the owner can read and mark-read their own notifications only.
-- ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null default 'general',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_owner_read"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_owner_update"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- ------------------------------------------------------------
-- Queue position maintenance: when a waiting consumer leaves,
-- everyone behind them moves up one spot (security definer so the
-- client API can call it without per-row RLS gymnastics).
-- ------------------------------------------------------------
create or replace function public.decrement_positions_after(p_before_position int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.queue_entries set position = position - 1
  where status = 'waiting'
    and position is not null
    and position > p_before_position;
$$;