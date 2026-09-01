-- ============================================================
-- 0012_listener_availability.sql
-- Module 7: Listener Dashboard & Availability
--   profiles.availability (weekly schedule) for listeners.
-- Project: Our Ears Are Open
-- ============================================================

-- Weekly availability schedule for a listener.
-- Shape: { "monday": ["9:00 AM", "10:00 AM"], "tuesday": [...] }
-- Only meaningful for users with role = 'listener'.
alter table public.profiles
  add column if not exists availability jsonb not null default '{}'::jsonb;
