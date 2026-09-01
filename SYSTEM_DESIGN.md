# Our Ears Are Open — System Design & Build Tracker

**Status:** 🔵 In Progress | 🟢 Done | 🟡 Blocked | ⚪ Not Started

**Architecture:** Next.js 16 (App Router) + Supabase (Postgres, Auth, Realtime, Storage) + Stripe + Twilio. Next.js API routes for server-only glue code (Stripe/Twilio/webhooks). No separate backend directory — single repo, single deploy.

**Convention for this document:**
- Each module has a **TO-DO** list of concrete tasks.
- When a task is complete, change its checkbox from `- [ ]` to `- [x]` and update the module status icon to `🟢`.
- Each module has a **Questions** section — log any open questions, decisions needed, or blockers here as they arise during that module's build.
- Cross off tasks as you finish to keep the tracker accurate.
- Each module MUST include a **How to test** section — concrete manual steps that let the developer (or client) verify the module's implementation independently before moving on. Write the test steps as you build, and confirm each one passes before marking the module 🟢.

**How to run the app for testing:**
1. `pnpm install` (first time)
2. `cp .env.example .env.local` and fill in the Supabase URL + anon key + service-role key (never commit `.env.local`)
3. `pnpm dev` → open `http://localhost:3000`
4. `pnpm build` → must complete with no errors (this is the source of truth for type/build correctness)

> Note: tests are **manual** right now (no framework installed). Each module's "How to test" section below is the checklist to run. When a module depends on a service (email via Resend, payments via Stripe, SMS/calls via Twilio), those items are marked **Blocked until client provides credentials** — test what you can with the rest working.

---

## Setup: Project Foundation (Phase 0)

**Status:** 🟢

### TO-DO
- [x] Install `@supabase/supabase-js` and `@supabase/ssr` dependencies
- [x] Create `lib/supabase/client.ts` (browser client)
- [x] Create `lib/supabase/server.ts` (server-side cookie client)
- [x] Create `lib/supabase/admin.ts` (service-role client, server-only)
- [x] Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Create `supabase/migrations/` folder for SQL migrations
- [x] Wire Supabase Auth into `hooks/use-auth.ts` to replace the stub *(in progress — see Module 1)*
- [x] Verify build passes (`pnpm build`) after wiring

### Questions
- ✅ **Resolved:** MCP reconnected to `cxwrvstojafdjqvelbno` (was `zlqairttoyxbxwccwrhb`) via global `opencode.json`. Restart required to take effect.
- ✅ **Resolved:** Service role key obtained and stored locally.

---

## Module 1: Auth & Users

**Status:** 🟡

Handles registration, login, session persistence, password reset, email verification, and role assignment. This is the foundation — everything depends on it.

### TO-DO
- [x] **DB schema applied:** `profiles` table + `user_role` enum created on `cxwrvstojafdjqvelbno` (migration `0001_auth_users.sql`)
- [x] **DB trigger:** auto-create `profiles` row on new auth signup (`handle_new_user`)
- [x] **RLS policies:** users read/update own profile; admins read all
- [x] **Secure functions:** revoked public/anon/authenticated EXECUTE on trigger functions; fixed search_path
- [x] **`use-auth.ts` re-wired** to Supabase Auth + `profiles` table (returns real user, role, reactive to auth changes)
- [x] **`middleware.ts`** added — refreshes session, protects `/profile` `/book-listener` `/payment` `/chat-queue` `/session`, redirects signed-in users off auth pages
- [x] **Sonner Toaster** added to root layout
- [x] **Login form** wired to `signInWithPassword` + role-based redirect + validation + toasts
- [x] **Register form** wired to `signUp` + profile upsert + redirect to `/profile/setup`
- [x] **Logout button** (desktop + mobile) wired to `signOut`
- [x] **Forgot-password form** wired to `resetPasswordForEmail` with redirect to `/reset-password`
- [x] **Reset-password form** wired to `exchangeCodeForSession` + `updateUser` (handles `token` and `code`)
- [x] **Email-verification flow** handled in register form (detects `identities.length === 0`, shows "check your email" screen instead of redirecting to profile)
- [ ] Google/Apple OAuth wiring (awaiting client credentials — buttons left static)
- [ ] Admin/super-admin role-gated route protection (middleware reads role)
- [ ] Verify all role-based nav links render correctly in navbar

### How to test — Module 1
Run with `pnpm dev` (open `http://localhost:3000`). Recommended: create a fresh test account each time.

**Registration**
1. Visit `/register`. Fill the form and submit.
2. If email confirmation is ON (needs client's dashboard toggle + Resend): you should see the **"Check your email"** screen — do NOT get sent to profile setup. Open the verification email, click the link, then log in. *(Blocked until client configures Resend + toggles "Confirm email".)*
3. If email confirmation is OFF: after submit you're redirected to `/profile/setup`.
4. In Supabase Dashboard → Authentication → Users, confirm a `profiles` row was auto-created for the new user with `role = customer`.

**Login / Logout**
5. Log out (navbar). Visit `/profile` while logged out → you're redirected to `/login`. `/book-listener`, `/payment`, `/chat-queue`, `/session` behave the same.
6. Log in with the test account → you return to the app (role-based home). Log out again → auth pages (`/login`, `/register`, `/forgot-password`) are blocked once logged in (redirected away).

**Password reset (works without an email provider? — No, needs Resend)**
7. `/forgot-password` → enter email → "If that account exists, a reset link was sent." *(Blocked until Resend configured.)*
8. `/reset-password?code=...` flow completes a real password change. Can only be end-to-end tested once email sending works.

**Quick DB-level check (developer)**
```sql
select id, email, role, profile_complete from public.profiles;
```
Rows appear on each signup automatically.

### Questions
- ✅ **Resolved:** MCP reconnected to `cxwrvstojafdjqvelbno` (was on `zlqairttoyxbxwccwrhb`). Migration tooling now works directly.
- ✅ **Resolved:** Service role key added to `.env.local` (local only, never committed).
- ✅ **Resolved:** Advisor warnings for `handle_new_user`/`handle_updated_at` fixed. `rls_auto_enable` warning is a Supabase-internal helper — safe to ignore.
- ✅ **Resolved:** Client forms using `useSearchParams` caused build-time prerender error — fixed by wrapping in `<Suspense>`.
- ❓ **CLIENT ACTION REQUIRED (email verification):** To *enforce* email confirmation, the client must toggle **"Confirm email" ON** in Supabase Dashboard → Authentication → Providers → Email. The frontend already handles the required-verification flow; only the dashboard toggle gates actual enforcement.
- ❓ **CLIENT ACTION REQUIRED (email provider):** Sending verification/reset emails requires a Resend account + verified domain + API key. See the client message (left with user).
- ❓ **CLIENT ACTION REQUIRED (OAuth):** Google OAuth (Client ID/Secret) + Apple credentials needed to wire the login/register OAuth buttons. Buttons left static for now.
- ❓ **Pending:** Role-gated route protection for listener/admin/super-admin portals (middleware currently only checks authentication, not role).

---

## Module 2: User Profile & Onboarding

**Status:** 🟡

Completes the user's profile after signup (the `/profile/setup` wizard), personal info, and preferences. Optional assigned-listener link.

### TO-DO
- [x] `profiles` table schema extended: +`country`, `gender_identity`, `sexual_orientation`, `relationship_status`, `religion_importance`, `spiritual`, `prior_therapy`, and self-referencing `assigned_listener_id` FK (migration `0003`)
- [x] `avatars` storage bucket + per-user RLS (paths namespaced `<uid>/`) (migration `0003`)
- [x] Profile CRUD via `lib/supabase/client.ts` (owner select/update; admin read via `is_admin()` helper)
- [x] 3-step `/profile/setup` wizard (`components/profile/profile-setup-wizard.tsx`) with real per-step save + avatar upload → sets `profile_complete`
- [x] `/profile/setup` is a server page (auth-guarded, loads profile, `?next=` return param)
- [x] `/profile` (`components/profile/profile-view.tsx`) wired to real data: header (name/email/avatar/member-since), Info tab (all fields), Settings tab (avatar edit, change password, delete account); Conversations/Documents left as empty states (depend on Modules 3/5)
- [x] `delete_my_account` SECURITY DEFINER RPC (migration `0004`) for self-service account deletion
- [x] Completion guard helper `lib/require-profile.ts` (redirects incomplete profiles to `/profile/setup`) — ready to apply to booking routes
- [x] Fixed infinite-recursion in `admins_read_all_profiles` via `is_admin()` SECURITY DEFINER helper (migration `0005`)
- [x] End-to-end verified: signup trigger → profile read → full update → avatar upload → delete account (via admin-created confirmed test user)
- [ ] Assigned listener link UI (customer ↔ listener) — column exists; UI deferred until listener profiles (Module 3+/admin) exist
- [ ] `isProfileComplete` client-side shortcut / booking-route guard wiring (deferred to Module 3)

### Questions
- ✅ **Resolved:** Added preference columns (gender, religion, orientation, etc.) as flexible `text` to keep the self-describe/"prefer not to say" options generic across all matching preferences.
- ✅ **Resolved:** Avatar storage bucketed as `avatars/<uid>/<file>` (public reads, owner-only writes) — collisions avoided by per-user path.
- ❓ **Pending (Module 3):** Whether booking should enforce strict completion (guard) vs. soft prompt. `require-profile.ts` supports either; default will be strict redirect, overridable per-route.
- ❓ **Pending (listener/admin):** Assigned-listener matching logic and how listeners get tagged as `listener` role (admin workflow not yet built).

### How to test — Module 2
Log in as a consumer account (create one via `/register`; email confirmation may need to be off for now).

**Profile setup wizard**
1. Visit `/profile/setup`. Step 1 (Personal Details): upload an avatar photo — the thumbnail updates and a toast says "Photo updated"; set name/pronouns/age/country. Click **Save & Continue**.
2. Step 2 (About You): pick gender/orientation/relationship/religion/spiritual/therapy. **Save & Continue**.
3. Step 3 (Review): add an optional reason + check the consent box. Click **Finish & Continue** → redirected to `/profile`.
4. In Supabase Dashboard → Table Editor → `profiles`, confirm the row for your user now has **all** fields filled and `profile_complete = true`.

**Profile page + persistence**
5. On `/profile`, confirm the header shows your **real** name, email, and your uploaded avatar; badges show "Member since …" and "Profile complete".
6. Info tab lists every field you entered. Settings tab shows Notifications, Security, Payment Methods (coming soon), Change Password.
7. Log out and back in → all your data still shows (persists in DB).

**Avatar storage check (developer)**
In Supabase Dashboard → Storage → `avatars`, confirm a file exists at `<your-user-id>/avatar.*`. Try uploading again — it overwrites (no duplicate).

**Delete account**
8. Settings → **Delete Account**. Confirm the dialog. The `profiles` row and `auth.users` row for the user should be gone from the Dashboard, and visiting `/profile` again forces a login.

---

## Module 3: Booking (Scheduled Sessions)

**Status:** 🟡

The book-listener multi-step flow: choose phone/chat type, concern, listener preferences, date/time, then payment. Creates a booking that persists in the DB.

### TO-DO
- [x] `bookings` table (user_id, listener_id, type, concern, preferences jsonb, slot_start/end, status pending/confirmed/completed/cancelled/no_show, payment_intent_id) + RLS (migration `0006`)
- [x] `availability_slots` table (listener_id, starts_at, ends_at, is_booked, booking_id) + RLS (migration `0006`)
- [x] RLS: customers own their bookings; listeners see assigned; admins see all (via `is_admin()`)
- [x] `/book-listener` converted to `BookListenerFlow` client component — collects type, payment option (paid/free), concern (5-word min), listener preferences, date + time, and creates a real `bookings` row on "Confirm Booking"
- [x] Booking page server-guarded: incomplete profile → redirect to `/profile/setup?next=/book-listener`
- [x] List upcoming + past bookings on `/profile` Conversations tab (real data) with Cancel action
- [x] End-to-end verified: create booking → list → cancel → RLS isolation → availability slots (via confirmed test user; cleaned up)
- [ ] Booking hold / time-lock while paying (needs payment timing from Module 4)
- [ ] Reschedule booking UI
- [ ] Booking confirmations via email *(Blocked until Resend configured)*

### Questions
- ✅ **Resolved:** Payment stays out of scope for Module 3 — `bookings` created with `status = pending`, `payment_intent_id` left null; Module 4 (Stripe) flips to `confirmed` on webhook.
- ✅ **Resolved:** Booking page guard behavior — unauthenticated users are sent to `/login` by middleware; authenticated-but-incomplete profiles are sent to `/profile/setup` (soft prompt still shown to logged-out visitors).

### How to test — Module 3
Log in as a profile-complete consumer (create one, complete `/profile/setup` first, or set `profile_complete = true` in the DB).

**Creating a booking**
1. Visit `/book-listener`. Pick a conversation type (Phone/Chat) and Paid or Free. Select a date and a time slot. Type at least 5 words in "what's on your mind".
2. Click **Confirm Booking** → a success screen appears with "Continue to Payment" + "Go to Profile".
3. In Supabase Dashboard → Table Editor → `bookings`, confirm a row exists with your `user_id`, the chosen `type`, `payment_option`, `concern`, `preferences` (JSON), `slot_start`/`slot_end` (15 min apart), and `status = pending`.

**Validation**
4. Try to confirm with fewer than 5 words → blocked. Try without a date or time → blocked. If logged out, you see the Sign up / Log in step instead of Confirm.

**Viewing + cancelling on profile**
5. Go to `/profile` → Conversations tab → your booking appears under **Upcoming** with its type and time.
6. Click **Cancel** → status flips to `cancelled` in the DB and it moves to **History**.

**RLS isolation (developer)**
7. As a second user, confirm you cannot see or modify the first user's bookings.
```sql
select id, user_id, type, status, slot_start from public.bookings;
```

**Guard**
8. With an authenticated but incomplete profile, `/book-listener` redirects to `/profile/setup?next=/book-listener`.

*Note: Booking confirmation email is pending Resend (client).*

---

## Module 4: Payments (Stripe)

**Status:** 🟡 (backend + UI wired; blocked on live testing until Stripe keys)

All money movement: booking payment, one-off donations, chat-queue minimum payment, saved payment methods, and Stripe webhooks. This uses **Next.js API routes** (server-only, holds Stripe secret key).

### TO-DO
- [x] Install `stripe` SDK (`stripe@22`), `@stripe/stripe-js`, `@stripe/react-stripe-js`
- [x] Create `app/api/stripe/payment-intent/route.ts` (create PaymentIntent for booking/donation)
- [ ] Create `app/api/stripe/payment-methods/route.ts` (list/add/remove saved methods) — **deferred**
- [x] Create `app/api/webhooks/stripe/route.ts` (verify signature, `payment_intent.succeeded` / `payment_failed` / `canceled`; idempotent; confirms paid bookings)
- [x] Create `payments` table (stripe_payment_intent_id, user_id, amount_cents, type, bookings_id, status, receipt_url) — migration `0007_payments.sql`
- [x] Wire `/payment?booking=<id>` page to create + confirm a real PaymentIntent (Stripe Elements)
- [x] Wire `/donate` page for one-time donations (recurring/monthly deferred)
- [x] Mark booking confirmed only on successful webhook (not on client success)
- [ ] Admin-initiated refunds — **deferred**
- [ ] Email receipts on payment — **deferred (needs Resend)**
- [x] Webhook security: verify Stripe signature, never trust client
- [x] Typed Supabase clients via `lib/supabase/database.types.ts` (Database generic on client/server/admin)

### Questions
- Recurring donations: use Stripe Checkout/Subscriptions + customer portal (deferred to a later pass).

### How to test — Module 4
Code is complete and `pnpm build` passes, but end-to-end payment requires **real Stripe keys** (test + live) — apply them in `.env.local` and restart. Env keys: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
1. Configure Stripe webhook to point at `POST /api/webhooks/stripe` (encrypted/written events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`) and put the signing secret in `STRIPE_WEBHOOK_SECRET`.
2. With test keys: book a session → `/payment?booking=<id>` loads Stripe Elements, shows `$10.99`, and a test card (`4242 4242 4242 4242`) completes the payment and redirects to `/payment/success`.
3. A `payments` row is created (`requires_payment_method` → `succeeded`); the booking is only marked `confirmed` **after** the webhook fires, not on the client.
4. Webhook signature is verified — forging/replaying the request fails with 400.
5. `/donate`: pick an amount → a donation PaymentIntent is created → test-card payment succeeds → `/donate/success`.
6. Canceling the PaymentIntent on the Stripe dashboard reflects `canceled` via the webhook.
7. *Blocked until the client provides Stripe keys (test + live).*

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

### How to test — Module 5
Fill in as Module 5 is built. Expected checklist:
1. Paying the $1 minimum and joining `/chat-queue` inserts a `queue_entries` row with `status = waiting`.
2. The widget shows a realtime position that decrements as earlier customers are assigned.
3. When a listener toggles available, the next waiting customer is auto-assigned and both see the pairing update in realtime.
4. Leaving the queue updates status (and refunds if applicable).
5. RLS: a customer sees only their own entry; a listener sees the waiting pool; admin sees all.

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

### How to test — Module 6
Fill in as Module 6 is built. Expected checklist:
1. On `/session/[id]`, opening two browser tabs as customer + listener shows messages appearing in realtime via Supabase Realtime (no page refresh).
2. A `sessions` row is created/updated with correct status transitions.
3. `app/api/twilio/token` mints a valid access token (call via website Twilio SDK — **Blocked until client provides Twilio credentials**).
4. Listener-initiated outbound call connects and call start/end are recorded.
5. "Listener joined"/"Listener left" status notifications appear in the session.
6. Voice duration is recorded for hours tracking.

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

### How to test — Module 7
Fill in as Module 7 is built. Expected checklist:
1. Admin creates a listener account (username). Listener logs in with the temp password and is forced to set a real one on first login.
2. Listener is redirected to `/team-member` portal (not the consumer app).
3. Listener sets availability schedule + queue toggle; a `listeners` row reflects it.
4. Listener views the assigned consumer's profile + signup answers before a session.
5. Voice/chat session starts from the dashboard.
6. Safety disconnect button records a reason.
7. Weekly hours tracked; 14-min warning + auto-end at 15; manual extension works; a 15hr/week cap blocks further sessions.
8. Follow-up booking with a paid consumer sends a payment link to the consumer's email (listener never sees payment).

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

### How to test — Module 8
Fill in as Module 8 is built. Expected checklist:
1. A booked session moves through `scheduled → in_progress → completed` (or `no_show`/`cancelled`) correctly.
2. Private/shared notes saved per session are visible only to the intended team members for that consumer.
3. Customer session history shows past sessions with listener/type/documents.
4. A PDF of session notes downloads from the `documents` row.
5. Automatic post-session email (synopsis) is sent *(Blocked until Resend configured)*.
6. No-show handling frees the slot.
7. 24h + 15-min reminders fire *(Blocked until email/SMS configured)*.

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

### How to test — Module 9
Fill in as Module 9 is built. Expected checklist:
1. `/admin` is only reachable by an `admin`/`super_admin`; non-admins get redirected.
2. Admin dashboard stats render real counts.
3. Listener add/remove/deactivate workflow works end-to-end.
4. Hours dashboard matches the 15hr/week data.
5. Chat/phone session list shows accurate duration/status.
6. User list search + profile view + delete/reinstate works.
7. Community room content edits persist.
8. Reports feed correct data to charts.
9. Refund + internal support notes workflow works.

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

### How to test — Module 10
Fill in as Module 10 is built. Expected checklist:
1. `/super-admin` is only reachable by a `super_admin`; everyone else is redirected.
2. Platform health dashboard shows real revenue/counts/alerts.
3. `org_config` edits (name, logo, support email, crisis links, timezone) reflect on the site.
4. Feature flags toggles turn queue/donations/free-booking on/off.
5. Stripe products/prices configured through the UI.
6. Role assignment promotes/demotes admin & listener correctly.
7. Sensitive actions write `audit_log` entries.
8. System notifications (email/SMS) send with configured templates.

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

### How to test — Module 11
Fill in as Module 11 is built. Expected checklist:
1. Community room titles/descriptions/order editable by admin and reflected on the public community page.
2. Crisis content editable and displayed correctly.
3. New free signup triggers a verification email with a working button redirect *(Blocked until Resend configured)*.
4. Booking confirmed → confirmation email; paid follow-up → payment link; any payment → receipt; post-session → synopsis email *(all Blocked until Resend configured)*.
5. Emails to team members/consumers send with correct templates (ongoing).

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
