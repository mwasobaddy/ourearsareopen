-- ============================================================
-- 0007_payments.sql
-- Module 4: Payments (Stripe) — payments ledger + RLS.
-- Project: Our Ears Are Open
-- ============================================================

-- Payment records. Each row maps to a Stripe PaymentIntent and optionally to
-- a booking (paid bookings) — donations have a null bookings_id.
create type public.payment_type as enum ('booking', 'donation');
create type public.payment_status as enum (
  'requires_payment_method', 'requires_confirmation', 'requires_action',
  'processing', 'succeeded', 'canceled', 'failed'
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  bookings_id uuid references public.bookings (id) on delete set null,
  type public.payment_type not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  status public.payment_status not null default 'requires_payment_method',
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount_cents >= 0)
);

create index payments_user_id_idx on public.payments (user_id);
create index payments_bookings_id_idx on public.payments (bookings_id);

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

alter table public.payments enable row level security;

-- A payment is owned by the user who initiated it.
create policy "customer_read_own_payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Insert is limited to the (service-role) payment API routes; customers
-- may only create their own rows defensively.
create policy "customer_insert_own_payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Status updates are written by the Stripe webhook via the service role,
-- but allow the owning customer to update their own rows' status too.
create policy "customer_update_own_payments"
  on public.payments for update
  using (auth.uid() = user_id);

-- Admins + super admins manage everything.
create policy "admins_all_payments"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());
