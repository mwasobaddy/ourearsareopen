-- ============================================================
-- 0002_secure_functions.sql
-- Phase 1 hardening: revoke EXECUTE on trigger functions,
-- fix search_path, so they can't be called via RPC.
-- Project: Our Ears Are Open
-- ============================================================

-- These are SECURITY DEFINER trigger functions. They must not be
-- callable by anon/authenticated via PostgREST RPC.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_updated_at() from public;
revoke execute on function public.handle_updated_at() from anon, authenticated;

-- Fix mutable search_path warnings
alter function public.handle_updated_at()
  security invoker
  set search_path = public;

alter function public.handle_new_user()
  set search_path = public;
