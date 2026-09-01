-- ============================================================
-- 0009_queue_position.sql
-- Module 5: Open Chat Queue — server-maintained FIFO position.
-- Position is only ever written by the (service-role) API routes so
-- customers see their own position in realtime without reading the pool.
-- Project: Our Ears Are Open
-- ============================================================

alter table public.queue_entries
  add column if not exists position integer;

create index queue_entries_queue_pos_idx
  on public.queue_entries (status, position);
