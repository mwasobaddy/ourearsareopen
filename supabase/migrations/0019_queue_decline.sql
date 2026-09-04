-- ============================================================
-- 0019_queue_decline.sql
-- Listener "decline" for the open chat queue (SCOPE 5.3 / 7.5).
--   - extend queue_status enum with 'declined'
--   - record why a listener declined an entry (decline_reason)
-- Project: Our Ears Are Open
-- ============================================================

alter type public.queue_status add value if not exists 'declined';

alter table public.queue_entries
  add column if not exists decline_reason text;