-- ============================================================
-- 0014_admin_support.sql
-- Module 9: Admin Interface
--   profiles.is_active flag (admin deactivate/reinstate) +
--   support_tickets table (internal support + refund requests).
-- Project: Our Ears Are Open
-- ============================================================

-- Admin can deactivate (soft-disable) a listener or consumer account.
-- Default true; admins flip it via the admin UI. This does not delete data.
alter table public.profiles
  add column is_active boolean not null default true;

-- Internal support + refund-request records.
-- Actual Stripe refunds fire client-side (blocked until Stripe creds); this
-- table persists the request, reason, and internal notes for the audit trail.
create type public.support_kind as enum ('refund', 'support');

create type public.support_status as enum ('open', 'resolved');

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  payment_id uuid references public.payments (id) on delete set null,
  kind public.support_kind not null default 'support',
  subject text not null,
  description text,
  internal_notes text,
  status public.support_status not null default 'open',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_user_idx on public.support_tickets (user_id);
create index support_tickets_status_idx on public.support_tickets (status);

alter table public.support_tickets enable row level security;

-- Only admins + super admins manage support tickets.
create policy "admins_all_support_tickets"
  on public.support_tickets for all
  using (public.is_admin())
  with check (public.is_admin());
