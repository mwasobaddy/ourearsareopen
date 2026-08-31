# Our Ears Are Open — System Design & Build Tracker

**Status:** 🔵 In Progress | 🟢 Done | 🟡 Blocked | ⚪ Not Started

**Architecture:** Next.js 16 (App Router) + Supabase (Postgres, Auth, Realtime, Storage) + Stripe + Twilio. Next.js API routes for server-only glue code (Stripe/Twilio/webhooks). No separate backend directory — single repo, single deploy.

**Convention for this document:**
- Each module has a **TO-DO** list of concrete tasks.
- When a task is complete, change its checkbox from `- [ ]` to `- [x]` and update the module status icon to `🟢`.
- Each module has a **Questions** section — log any open questions, decisions needed, or blockers here as they arise during that module's build.
- Cross off tasks as you finish to keep the tracker accurate.

---

## Setup: Project Foundation (Phase 0)

**Status:** ⚪

### TO-DO
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr` dependencies
- [ ] Create `lib/supabase/client.ts` (browser client)
- [ ] Create `lib/supabase/server.ts` (server-side cookie client)
- [ ] Create `lib/supabase/admin.ts` (service-role client, server-only)
- [ ] Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Create `supabase/migrations/` folder for SQL migrations
- [ ] Wire Supabase Auth into `hooks/use-auth.ts` to replace the stub
- [ ] Verify build passes (`pnpm build`) after wiring

### Questions
- (none yet)

---

## Module 1: Auth & Users

**Status:** ⚪

Handles registration, login, session persistence, password reset, email verification, and role assignment. This is the foundation — everything depends on it.

### TO-DO
- [ ] Use Supabase Auth for email/password sign up (`supabase.auth.signUp()`)
- [ ] Supabase Auth sign in / sign out (`signInWithPassword`, `signOut`)
- [ ] Session persistence via `@supabase/ssr` cookies + middleware to protect routes
- [ ] Role assignment: add a `role` column to `profiles` table (customer, listener, admin, super_admin)
- [ ] Middleware that reads `role` and redirects to correct portal (`/team-member`, `/admin`, `/super-admin`, `/profile`)
- [ ] Wire `/login`, `/register`, `/logout` pages to real Supabase calls (replace TODO stubs)
- [ ] Password reset flow (`forgot-password`, `reset-password`) via Supabase auth emails
- [ ] Email verification (`verify-email`) via Supabase auth
- [ ] Update `hooks/use-auth.ts` to return real user + role
- [ ] DB trigger or RLS to create a `profiles` row on new signup
- [ ] RLS policies: users can read/update only their own profile; admins read all
- [ ] Verify all role-based nav links render correctly in navbar

### Questions
- (none yet)

---

## Module 2: User Profile & Onboarding

**Status:** ⚪

Completes the user's profile after signup (the `/profile/setup` wizard), personal info, and preferences. Optional assigned-listener link.

### TO-DO
- [ ] Build `profiles` table schema (name, phone, avatar, pronouns, age range, reason, services consent)
- [ ] Profile CRUD via `lib/supabase/client.ts` (insert/update own profile)
- [ ] Wire `/register` → redirects to `/profile/setup` when profile incomplete
- [ ] Implement 3-step `/profile/setup` wizard with real save per step
- [ ] Avatar upload to Supabase Storage (`avatars` bucket)
- [ ] Profile completion state + redirect guard (if not complete, force setup)
- [ ] Wire `/profile` tabs: Conversations, Documents, Info, Settings to real data
- [ ] Preferences (gender, religion, language, orientation) stored + used in booking
- [ ] Assigned listener link (optional) — customer ↔ listener relationship

### Questions
- (none yet)

---

## Module 3: Booking (Scheduled Sessions)

**Status:** ⚪

The book-listener multi-step flow: choose phone/chat type, concern, listener preferences, date/time, then payment. Creates a booking that persists in the DB.

### TO-DO
- [ ] Create `bookings` table (user_id, listener_id, type, concern, preferences, slot, status, payment_intent_id)
- [ ] Availability: create `availability_slots` table + API to fetch slots by date/type
- [ ] Wire `/book-listener` 5-step form to create a real booking
- [ ] Booking hold (brief time-lock while user pays)
- [ ] List upcoming + past bookings on `/profile`
- [ ] Cancel booking (with policy)
- [ ] Reschedule booking
- [ ] RLS: customers own their bookings; listeners see assigned; admins see all
- [ ] Booking confirmations via email (Resend or Supabase Edge Function)

### Questions
- (none yet)

---

## Module 4: Payments (Stripe)

**Status:** ⚪

All money movement: booking payment, one-off donations, chat-queue minimum payment, saved payment methods, and Stripe webhooks. This uses **Next.js API routes** (server-only, holds Stripe secret key).

### TO-DO
- [ ] Install `stripe` SDK
- [ ] Create `app/api/stripe/payment-intent/route.ts` (create PaymentIntent for booking/donation/queue)
- [ ] Create `app/api/stripe/payment-methods/route.ts` (list/add/remove saved methods)
- [ ] Create `app/api/webhooks/stripe/route.ts` (verify signature, handle `payment_intent.succeeded`, `failed`; idempotency)
- [ ] Create `payments` table (stripe_payment_intent_id, user_id, amount_cents, type, ref_id, status)
- [ ] Wire `/payment` page to create + confirm a real PaymentIntent
- [ ] Wire `/donate` page for one-off donations
- [ ] Mark booking confirmed only on successful webhook (not on client success)
- [ ] Admin-initiated refunds
- [ ] Email receipts on payment
- [ ] Webhook security: verify Stripe signature, never trust client

### Questions
- (none yet)

---

## Module 5: Open Chat Queue

**Status:** ⚪

Users pay minimum ($1) to join a live queue; the next available listener is assigned; position updates in realtime.

### TO-DO
- [ ] `queue_entries` table (user_id, payment_id, status: waiting/assigned/left, assigned_listener_id)
- [ ] `app/api/queue/join/route.ts` — verify min payment, insert entry, match next available listener
- [ ] Realtime position updates via Supabase Realtime channel on `queue_entries`
- [ ] Wire `/chat-queue` page (replace the simulated timeout with real queue join)
- [ ] Listener "available for queue" toggle
- [ ] "Listeners available now" stat for widget
- [ ] Assign next customer to available listener (business logic)
- [ ] Leave queue + optional refund
- [ ] RLS: customer sees own entry; listeners see waiting pool; admins see all

### Questions
- (none yet)

---

## Module 6: Realtime — Voice & Chat

**Status:** ⚪

In-session chat (real-time text) and voice calls (phone appointments). Voice via Twilio/LiveKit initiated by the listener dialer. Chat via Supabase Realtime.

### TO-DO
- [ ] `sessions` table (booking_id/queue_ref, user_id, listener_id, status, started_at, ended_at, room_id, notes)
- [ ] Realtime chat: `messages` table + Supabase Realtime channel subscribe/publish
- [ ] Wire `/session/[id]` chat UI to realtime messages
- [ ] Twilio/LiveKit: `app/api/twilio/token/route.ts` to mint access token
- [ ] Listener dialer — initiate outbound call via website (no consumer call-in)
- [ ] Call start/end/disconnect handling
- [ ] Session state notifications ("Listener joined", "Listener left")
- [ ] Voice session duration recording

### Questions
- (none yet)

---

## Module 7: Listener Dashboard & Availability

**Status:** ⚪

The `/team-member` / workforce portal. Listener login (admin-created username + first-login password), availability, queue toggle, consumer profiles, hours tracking (15hr/week cap).

### TO-DO
- [ ] Listener accounts: admin creates username; listener sets password on first login
- [ ] Listener-only login + redirect to team portal
- [ ] `listeners` table (user_id, username, availability, queue_available, hours_this_week)
- [ ] Set availability schedule for scheduled bookings
- [ ] Queue availability toggle (if no appointments, join chat queue)
- [ ] View consumer profile + signup answers before session
- [ ] Start voice/chat session from dashboard
- [ ] Safety disconnect button (with reason)
- [ ] Hours tracking: weekly/monthly calls + chats; enforce 15hr/week (1099 cap)
- [ ] 14-minute warning before auto-end; extend by 5–10 min
- [ ] No auto-pop next session; debrief time required
- [ ] In-session follow-up booking; if paid → email payment link to consumer (listener never sees payment)

### Questions
- (none yet)

---

## Module 8: Session & Call Management

**Status:** ⚪

Full session lifecycle, notes, history, documents, no-shows, reminders, post-session emails.

### TO-DO
- [ ] Session lifecycle states (scheduled, in_progress, completed, no_show, cancelled)
- [ ] Default 15-min length; 14-min warning; auto-end; manual extension
- [ ] Private/shared session notes (visible to same-consumer team members)
- [ ] Session history for customer (past sessions, listener, type, documents)
- [ ] `documents` table + session notes PDF download
- [ ] Post-session email to consumer (synopsis + encouraging words) — automatic
- [ ] No-show handling (mark no-show, free slot)
- [ ] Email/SMS reminders (24h, 15 min before session)
- [ ] RLS: customer sees own history; listeners see assigned; admins see all

### Questions
- (none yet)

---

## Module 9: Admin Interface

**Status:** ⚪

Operations portal: listener management, session oversight, reports, content, refunds/support.

### TO-DO
- [ ] Admin-only route protection (`/admin`)
- [ ] Admin dashboard stats (active listeners, sessions, queue, donations)
- [ ] Listener management: add/remove/deactivate; hiring/firing workflow
- [ ] Monitor listener hours (weekly/monthly, 15hr cap) + hours dashboard
- [ ] Monitor chat + phone sessions (list, duration, status, audit)
- [ ] User list (consumers): search, view profile, delete/reinstate
- [ ] Content: community rooms edit (titles, descriptions, order)
- [ ] Reports (sessions, revenue, listener utilization, queue stats) → feed recharts
- [ ] Refunds + support (initiate refund, internal notes)
- [ ] Email tools (verify on signup, post-session synopsis, receipts)

### Questions
- (none yet)

---

## Module 10: Super Admin

**Status:** ⚪

Platform ownership: org config, feature flags, Stripe/billing config, role assignment, audit logs.

### TO-DO
- [ ] Super-admin-only route protection (`/super-admin`)
- [ ] Platform health dashboard (revenue, counts, alerts)
- [ ] `org_config` table + editor (name, logo, support email, crisis links, timezone)
- [ ] Feature flags (`feature_flags` table): open queue, donations, free booking, etc.
- [ ] Stripe/billing config (products, prices, webhook URL metadata)
- [ ] Role assignment (promote/demote admin, listener) via secure route
- [ ] `audit_log` table for sensitive actions
- [ ] System notifications (email/SMS provider + templates)

### Questions
- (none yet)

---

## Module 11: Content & Marketing

**Status:** ⚪

Community rooms, crisis content, and the full email system.

### TO-DO
- [ ] `content_rooms` table + API + admin editing
- [ ] `content_crisis` table + API + admin editing
- [ ] Email templates (booking confirm, reminder, password reset, receipt)
- [ ] Free signup → verification email with button redirect
- [ ] Post session → synopsis email
- [ ] Paid follow-up → payment link email
- [ ] Receipt on any payment
- [ ] Send emails to team members / consumers (ongoing)
- [ ] In-app notification center (optional)

### Questions
- (none yet)

---

## Cross-Module Decisions & Architecture Notes

This section captures decisions that span multiple modules. Revisit as you build.

- [ ] Confirm realtime approach: Supabase Realtime for chat/queue; Twilio or LiveKit for voice
- [ ] Confirm file storage: Supabase Storage buckets (`avatars`, `documents`)
- [ ] Confirm email provider: Resend (via Supabase Edge Function) vs built-in Supabase Auth emails
- [ ] Confirm RLS is the primary authorization mechanism everywhere
- [ ] Confirm Next.js API routes used only for server-secret glue (Stripe/Twilio/webhooks)
- [ ] Confirm deployment: Vercel (frontend+routes) + managed Supabase (DB/auth/storage/realtime)

### Open Cross-Cutting Questions
- (none yet)
