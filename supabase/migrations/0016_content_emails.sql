-- ============================================================
-- 0016_content_emails.sql
-- Module 11: Content & Marketing
--   content_rooms (community rooms), content_crisis (crisis
--   resources), email_templates (ready for Resend when configured).
-- Project: Our Ears Are Open
-- ============================================================

-- ------------------------------------------------------------
-- content_rooms: community support rooms shown on /community.
-- Public read (active rooms); admins/super admins manage all.
-- ------------------------------------------------------------
create table public.content_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  icon text not null default 'messages-square',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_rooms enable row level security;

create policy "content_rooms_public_read"
  on public.content_rooms for select
  using (true);

create policy "content_rooms_admin_write"
  on public.content_rooms for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed with the existing public rooms.
insert into public.content_rooms (slug, title, description, icon, sort_order, is_active) values
  ('wins',            'Wins & Milestones',      'Share your achievements — big or small. A space to celebrate and be celebrated.', 'trophy',            10, true),
  ('general',         'General Chat',           'Just want to talk? No topic needed — jump in and connect.',                    'messages-square',    20, true),
  ('anxiety',         'Anxiety & Stress',       'Talk through daily stress, worry, and anxiety with people who truly get it.',   'brain',              30, true),
  ('depression',      'Depression Support',     'A safe, judgment-free space for those navigating heavy days.',                  'heart',              40, true),
  ('relationships',   'Relationships',          'Couples, family dynamics, friendships — all conversations welcome.',            'users',              50, true),
  ('grief',           'Grief & Loss',           'You don''t have to grieve alone. Share memories, find comfort.',                  'cloud-rain',         60, true),
  ('self-improvement','Self-Improvement',       'Goals, habits, self-care, and personal growth conversations.',                   'trending-up',        70, true),
  ('lgbtq',           'LGBTQ+ Safe Space',      'An inclusive, affirming space for the LGBTQ+ community.',                        'rainbow',            80, true)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- content_crisis: crisis hotlines + resources on /crisis.
-- Public read; admins/super admins manage.
-- ------------------------------------------------------------
create table public.content_crisis (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  phone text,
  availability text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_crisis enable row level security;

create policy "content_crisis_public_read"
  on public.content_crisis for select
  using (true);

create policy "content_crisis_admin_write"
  on public.content_crisis for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed with the existing crisis resources.
insert into public.content_crisis (name, description, phone, availability, is_primary, sort_order) values
  ('988 Suicide & Crisis Lifeline',      'Free, confidential support 24/7 for people in distress.',                '988',            '24/7', true,  10),
  ('Crisis Text Line',                   'Text HOME to 741741 for free crisis support.',                           'Text HOME to 741741', '24/7', false, 20),
  ('National Domestic Violence Hotline', 'Support for those affected by domestic violence.',                        '1-800-799-7233', '24/7', false, 30),
  ('Trevor Project (LGBTQ+ crisis support)', '24/7 crisis support for LGBTQ+ individuals.',                        '1-866-488-7386', '24/7', false, 40),
  ('SAMHSA National Helpline',           'Treatment referral service for mental health and substance use.',        '1-800-662-4357', '24/7', false, 50),
  ('Veterans Crisis Line',               'Support for Veterans and their families.',                               '988, then press 1', '24/7', false, 60)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- email_templates: subject/body for transactional emails.
-- Sending is blocked until Resend is configured; the super-admin
-- can author/edit templates in advance.
-- ------------------------------------------------------------
create table public.email_templates (
  key text primary key,
  subject text not null,
  body text not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.email_templates enable row level security;

create policy "email_templates_super_admin_read"
  on public.email_templates for select
  using (public.is_super_admin());

create policy "email_templates_super_admin_write"
  on public.email_templates for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Seed default templates.
insert into public.email_templates (key, subject, body, description) values
  ('welcome',          'Welcome to {{ org_name }}',            'Hi {{ first_name }}, thanks for joining {{ org_name }}. Your journey starts here.', 'Sent after account creation.'),
  ('booking_confirm',  'Your conversation is booked',          'Hi {{ first_name }}, your {{ type }} conversation is confirmed for {{ slot_start }} with {{ listener_name }}.', 'Sent when a booking is confirmed.'),
  ('booking_reminder', 'Reminder: your conversation',          'Hi {{ first_name }}, a friendly reminder about your conversation on {{ slot_start }}.', 'Sent before a scheduled session.'),
  ('session_receipt',  'Your payment receipt',                 'Hi {{ first_name }}, thanks! Here is your receipt for {{ amount }}.', 'Sent after any successful payment.'),
  ('session_synopsis', 'Here is a summary of your session',    'Hi {{ first_name }}, thanks for talking with us today. Your listener has shared a summary.', 'Sent after a completed session.')
on conflict (key) do nothing;
