-- ============================================================
-- 0018_reseed_baseline_config.sql
-- Re-seed baseline config + content + email templates after a
-- full DB clear (TRUNCATE wiped the original 0015/0016 seed rows).
-- Idempotent (ON CONFLICT DO NOTHING).
-- Project: Our Ears Are Open
-- ============================================================

-- org_config (single row)
insert into public.org_config (id, org_name, support_email, timezone, crisis_links)
values (
  1,
  'Our Ears Are Open',
  'support@ourearsareopen.com',
  'America/New_York',
  '[
    {"label":"988 Suicide & Crisis Lifeline","url":"https://988lifeline.org"},
    {"label":"Crisis Text Line","url":"https://www.crisistextline.org"}
  ]'::jsonb
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- feature_flags
-- ------------------------------------------------------------
insert into public.feature_flags (key, enabled, description) values
  ('open_queue',     true,  'Allow consumers to join the open chat queue with a donation.'),
  ('donations',      true,  'Allow one-off donations on the donate page.'),
  ('free_booking',   true,  'Allow a free 15-minute booking option.'),
  ('scheduled_phone',true,  'Allow scheduled phone appointments (by appointment only).')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- content_rooms
-- ------------------------------------------------------------
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
-- content_crisis
-- ------------------------------------------------------------
insert into public.content_crisis (name, description, phone, availability, is_primary, sort_order) values
  ('988 Suicide & Crisis Lifeline',      'Free, confidential support 24/7 for people in distress.',                '988',            '24/7', true,  10),
  ('Crisis Text Line',                   'Text HOME to 741741 for free crisis support.',                           'Text HOME to 741741', '24/7', false, 20),
  ('National Domestic Violence Hotline', 'Support for those affected by domestic violence.',                        '1-800-799-7233', '24/7', false, 30),
  ('Trevor Project (LGBTQ+ crisis support)', '24/7 crisis support for LGBTQ+ individuals.',                        '1-866-488-7386', '24/7', false, 40),
  ('SAMHSA National Helpline',           'Treatment referral service for mental health and substance use.',        '1-800-662-4357', '24/7', false, 50),
  ('Veterans Crisis Line',               'Support for Veterans and their families.',                               '988, then press 1', '24/7', false, 60)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- email_templates
-- ------------------------------------------------------------
insert into public.email_templates (key, subject, body, description) values
  ('welcome',          'Welcome to {{ org_name }}',            'Hi {{ first_name }}, thanks for joining {{ org_name }}. Your journey starts here.', 'Sent after account creation.'),
  ('booking_confirm',  'Your conversation is booked',          'Hi {{ first_name }}, your {{ type }} conversation is confirmed for {{ slot_start }} with {{ listener_name }}.', 'Sent when a booking is confirmed.'),
  ('booking_reminder', 'Reminder: your conversation',          'Hi {{ first_name }}, a friendly reminder about your conversation on {{ slot_start }}.', 'Sent before a scheduled session.'),
  ('session_receipt',  'Your payment receipt',                 'Hi {{ first_name }}, thanks! Here is your receipt for {{ amount }}.', 'Sent after any successful payment.'),
  ('session_synopsis', 'Here is a summary of your session',    'Hi {{ first_name }}, thanks for talking with us today. Your listener has shared a summary.', 'Sent after a completed session.')
on conflict (key) do nothing;