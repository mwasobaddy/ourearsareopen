-- ============================================================
-- 0010_queue_positions_rpc.sql
-- Module 5: Open Chat Queue — RPC to advance FIFO positions.
-- Called (service-role, server-only) after the earliest waiting entry is
-- assigned, so every remaining waiting customer's live position drops by 1.
-- Project: Our Ears Are Open
-- ============================================================

create or replace function public.decrement_waiting_positions()
returns void
language sql
security definer
set search_path = public
stable
as $$
  update public.queue_entries
  set position = position - 1
  where status = 'waiting' and position is not null;
$$;

revoke execute on function public.decrement_waiting_positions() from public, anon;
grant execute on function public.decrement_waiting_positions() to authenticated;
