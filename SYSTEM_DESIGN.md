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

**Status:** 🟡 (code done; queue payment requires client Stripe keys to test)

Users pay minimum ($1) to join a live queue; the next available listener is assigned; position updates in realtime.

### TO-DO
- [x] Migrations `0008_queue.sql`, `0009_queue_position.sql`, `0010_queue_positions_rpc.sql` — `queue_entries` table, RLS, `profiles.open_queue_enabled`, `position`, `decrement_waiting_positions()` RPC, realtime publication
- [x] `app/api/queue/join/route.ts` — verify succeeded `queue` payment, insert entry, FIFO-match next available listener (`open_queue_enabled`)
- [x] Realtime position updates via Supabase Realtime channel on `queue_entries` (`QueueStatus` component)
- [x] `/chat-queue/success` page + `QueueStatus` client component (join + live position → assignment)
- [x] `app/api/queue/toggle/route.ts` — listener "available for queue" toggle (assigns earliest waiting customer when turning ON)
- [x] `app/api/stripe/payment-intent/route.ts` widened to `type: "queue"` (min $1)
- [x] Rewritten queue payment form (`chat-queue-donation-form.tsx`) → PaymentIntent → `PaymentForm` → `/chat-queue/success?payment=`
- [ ] "Listeners available now" stat for widget
- [ ] Leave queue + optional refund
- [ ] RLS: listeners see waiting pool; admins see all (customer sees own entry — done)

### Questions
- (none yet)

### How to test — Module 5
Expected checklist (blocked until client Stripe keys are provided):
1. Paying the $1 minimum and joining `/chat-queue` inserts a `queue_entries` row with `status = waiting` (or `assigned` if a listener is available).
2. The `QueueStatus` widget shows a realtime position that decrements as earlier customers are assigned.
3. When a listener toggles available (`/api/queue/toggle`), the next waiting customer is auto-assigned and the assignment updates in realtime.
4. Leaving the queue updates status (and refunds if applicable).
5. RLS: a customer sees only their own entry.

---

## Module 6: Realtime — Voice & Chat

**Status:** 🟡 (realtime chat done; voice/Twilio portion blocked on client creds)

In-session chat (real-time text) and voice calls (phone appointments). Voice via Twilio/LiveKit initiated by the listener dialer (🔴 blocked until client credentials). Chat via Supabase Realtime — fully working now.

### TO-DO
- [x] Migration `0011_realtime_sessions.sql` — `sessions` table (mode chat/phone, status pending/active/left/ended/completed, origin from queue_entry_id or booking_id, notes, started_at/ended_at) + RLS (participants read/update, admins all) + realtime publication
- [x] `messages` table (session_id, sender_id, body) + RLS (participants read/insert) + realtime publication
- [x] `app/api/session/open/route.ts` — open/fetch a session from a queue entry or booking (participant-guarded; marks queue entry `connected`)
- [x] Realtime chat UI in `/session/[id]` (`components/session/session-room.tsx`) — live messages, send, history, participant status notifications ("participant left")
- [x] Session state notifications ("participant left", "you left") surfaced as system chips in the chat feed
- [x] `QueueStatus` assigned view now links into `/session/<entry>?origin=queue`
- [ ] `app/api/twilio/token/route.ts` to mint access token — 🔴 blocked (Twilio creds)
- [ ] Listener dialer — initiate outbound call via website (no consumer call-in) — 🔴 blocked
- [ ] Call start/end/disconnect handling — 🔴 blocked
- [ ] Voice session duration recording — 🔴 blocked (requires Twilio/LiveKit)

### Questions
- (none yet)

### How to test — Module 6
1. On `/session/[id]?origin=queue`, opening two browser tabs as customer + listener shows messages appearing in realtime via Supabase Realtime (no page refresh).
2. A `sessions` row is created (`status = active`, `started_at` set) when opened; its linked queue entry flips to `connected`.
3. Only the two participants can read/send messages (postgres RLS); guests/non-participants get 403.
4. Clicking "Leave" sets the session to `left` and a system chip appears on the other side; "End Session" sets `ended` and disables the input.
5. Voice (phone mode) still needs Twilio credentials — 🔴 client-blocked (see Module 6 client checklist).

---

## Module 7: Listener Dashboard & Availability

**Status:** 🟡 (core portal made real: queue toggle/pool/accept, availability, hours, consumer profile; remaining items build on Twilio + admin listener-provisioning)

The `/team-member` / workforce portal. Listener login (admin-created username + first-login password), availability, queue toggle, consumer profiles, hours tracking (15hr/week cap). Listeners are modeled as `profiles.role = 'listener'` (existing `is_listener()` helper) rather than a separate table.

### TO-DO
- [x] Migration `0012_listener_availability.sql` — `profiles.availability` (weekly schedule JSONB)
- [x] `GET/PUT /api/availability` — listener loads/saves weekly schedule
- [x] `GET /api/queue/pool` — listener-only waiting pool with (name, reason) via admin client (keeps profiles RLS intact)
- [x] `POST /api/queue/accept` — listener accepts a specific waiting consumer → assigned, pool FIFO bumps
- [x] `GET /api/queue/toggle` — read current queue-availability state
- [x] `GET /api/queue/customer/[id]` — listener views a consumer's profile/signup answers before a session (gated to consumers in the listener's care; email/phone withheld)
- [x] `/team-member/queue` real — availability toggle + real waiting pool + Accept (opens `/session/<entry>?origin=queue`) + consumer profile dialog
- [x] `/team-member/availability` real — load/save weekly schedule
- [x] `/team-member/dashboard` real — weekly/monthly hours computed from `sessions` (ended_at − started_at), 15hr cap progress, today's confirmed appointments with Open Chat/Start Call
- [ ] Listener accounts: admin creates username; listener sets password on first login
- [ ] Listener-only login + redirect to team portal
- [ ] Safety disconnect button (with reason)
- [ ] Enforce 15hr/week cap (block further sessions) — tracking done, enforcement pending
- [ ] 14-minute warning before auto-end; extend by 5–10 min
- [ ] No auto-pop next session; debrief time required
- [ ] In-session follow-up booking; if paid → email payment link to consumer (listener never sees payment)
- [ ] Start **voice** session from dashboard — 🔴 blocked (Twilio)

### Questions
- (none yet)

### How to test — Module 7
1. A listener opens `/team-member/queue`: toggling "Available for queue" persists (GET/POST `/api/queue/toggle`) and, when a customer waits, auto-assigns the earliest one; the pool shows real waiting consumers with name/reason.
2. Accepting a consumer assigns the queue entry to the listener, decrements everyone behind, and opens `/session/<entry>?origin=queue` (realtime chat).
3. The consumer profile dialog shows age range, pronouns, country, reason, prior therapy, relationship status, consent.
4. `/team-member/availability` loads and saves the weekly schedule to `profiles.availability`.
5. `/team-member/dashboard` shows weekly/monthly hours computed from the listener's completed sessions, the 15 hr/week capacity bar, and today's confirmed appointments with Open Chat/Start Call.
6. Remaining items (listener provisioning via username+first-login password, safety-disconnect with reason, hard 15hr enforcement, 14-min warning/extension, follow-up booking payment link, voice) are pending; voice additionally needs Twilio creds.

---

## Module 8: Session & Call Management

**Status:** 🟡 (session lifecycle + notes + docs + history done; no-show/reminders/post-session email blocked on client integrations)

Full session lifecycle, notes, history, documents, no-shows, reminders, post-session emails.

### TO-DO
- [x] Session lifecycle states (chat/phone via `sessions`; statuses `pending → active → completed`, or `left`/`ended`)
- [x] Session notes (`sessions.notes` + listener-only `PUT /api/session/[id]/notes`; via `SessionRoom` debrief panel)
- [x] `documents` table + `document_type` enum (session_notes/consent/other) with RLS (customer sees own, listeners/admins see assigned)
- [x] Finalize flow: `POST /api/session/[id]/complete` → `completed` + `ended_at`; auto-creates a `session_notes` `documents` row when the listener recorded notes
- [x] Listener session history page (`/team-member/sessions` — past sessions, mode, status, notes badge, open/continue link)
- [x] Customer documents tab (profile "Documents" now lists saved session-notes/consent documents from the customer's own rows)
- [x] RLS: customer sees own history; listeners see assigned; admins see all (`is_admin()` helper)
- [ ] Default session timing: 15-min length, 14-min warning, auto-end, manual extension
- [ ] Session notes PDF download/export from a `documents` row
- [ ] Post-session email to consumer (synopsis + encouraging words) — automatic *(Blocked until Resend configured)*
- [ ] No-show handling (mark no-show, free slot)
- [ ] Email/SMS reminders (24h, 15 min before session): 24h via Resend, 15-min via Twilio *(Blocked until client creds)*
- [ ] Customer-facing session history list (past sessions + listener/type) — currently covered by bookings "History" + Documents tab

### Questions
- (none yet)

### How to test — Module 8
1. Open a chat session as a listener (`/team-member` → Open Queue → accept → `/session/<entry>?origin=queue`).
2. In the session, the listener sees a **Debrief notes** panel: type notes, click **Save notes**, click **Complete session**. Confirm the session becomes `completed`.
3. Verify the auto-created document: log in as the consumer, open Profile → **Documents**, confirm the "Session notes" card appears with the synopsis.
4. As the listener, open `/team-member/sessions` and confirm the completed session appears with the `Has notes` badge; "View / open" reopens it.
5. A session marked **End Session** transitions to `ended` (not completed/docs).
6. `sessions` RLS — confirm a customer can only see their own sessions and a listener only their assigned ones.
7. Timing (14-min warning / auto-end), notes-PDF export, no-show, reminders, and post-session email remain **Blocked** until client credentials (see client checklist).

---

## Module 9: Admin Interface

**Status:** 🟡 (core admin portal real; community-rooms content deferred; Stripe refunds + listener auth provisioning client-blocked)

Operations portal: listener management, session oversight, reports, content, refunds/support.

### TO-DO
- [x] Admin-only route protection (`/admin`) — `requireAdmin()` guard (admin/super_admin) on every admin page
- [x] Admin dashboard stats (active listeners, today's sessions, queue waiting, 24h revenue) — real counts
- [x] Listener management: list real listeners + add (auth + profile) + deactivate/reactivate (`is_active`)
- [x] Monitor listener hours (weekly/monthly, 15hr cap) + hours — real from `sessions` (`lib/admin-data.ts`)
- [x] Monitor chat + phone sessions (list, duration, status, consumer/listener) + status/type filters (`SessionsFilter`)
- [x] User list (consumers): search, view profile, deactivate/reinstate (`is_active`)
- [x] Reports: sessions, revenue, new customers, listener utilization (users + hours/cap) — live aggregates
- [x] Refunds + support: `support_tickets` table (refund/support, status, internal notes) + create/resolve via API
- [x] `is_active` column + `support_tickets` table (migration `0014`) + RLS (admins only)
- [~] Listener provisioning (auth user + first-login password) — blocked until client enables Supabase password auth + email
- [~] Content: community rooms — no rooms feature in current build; site-wide content moves to Module 10 (org_config)
- [ ] Email tools (verify on signup, post-session synopsis, receipts) — blocked until Resend (see client checklist)

### Questions
- (none yet)

### How to test — Module 9
1. Log in as an `admin`/`super_admin` and open `/admin/dashboard` — real counts appear (no mock data).
2. As a `listener` (or logged out), visiting `/admin/*` redirects away (guard works).
3. `/admin/listeners` — real team members with weekly hours vs the 15hr cap; toggle **Deactivate/Reactivate** (persists `is_active`).
4. `/admin/listeners/[id]` — hours this week/month, calls/chats this week, recent sessions all real.
5. `/admin/sessions` — real sessions with consumer/listener names, duration, status; filters + search work.
6. `/admin/users` — real consumers; search by name/email; view profile; deactivate/reinstate.
7. `/admin/reports` — sessions, revenue, new customers, utilization computed live from real data.
8. `/admin/support` — create a refund/support ticket (persists to `support_tickets`); resolve/reopen works.
9. Blocked items: Stripe refund issuance (needs Stripe keys), listener auth user (needs Supabase password/email), community-rooms content (no feature).

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

---

## 👉 Client Action Required — Launch Checklist

> **Purpose:** A single, consolidated list of every external credential / account / toggle the **client** must provide before or at launch. Populated module-by-module as each build step hits a dependency that lives on the client's side (not the developer's). When all modules are done, this whole section is sent to the client as an onboarding email.
>
> **How to update:** As you build each module, drop any item that requires client credentials/accounts into the matching subsection below, with the exact name of the `.env.local` variable(s) it maps to and a short "why" note. Leave the "Module built?" mark blank until the module is fully live-tested against real credentials.

### Status legend
- `⬜ Not started` — module still to be built / item not yet reachable
- `🟡 Needs client input` — code is done but blocked on a client-provided credential/toggle
- `🟢 Ready` — client has provided this and it is verified live

---

### Module 1 — Auth & Users

| # | Item needed from client | What it's for | Env var / where | Status |
|---|------------------------|---------------|-----------------|--------|
| 1 | **Supabase project** (already provided — `cxwrvstojafdjqvelbno`) | Hosting the database, auth, storage, realtime | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | 🟢 |
| 2 | **Enable "Confirm email"** in Supabase Auth → Providers → Email | Forces new users to verify their email address before signing in | Supabase dashboard (Authentication → Providers → Email → Confirm email) | 🟡 |
| 3 | **Resend API key + verified sending domain** | Sends verification / password-reset emails | `RESEND_API_KEY` + a domain verified in Resend | 🟡 |
| 4 | **Google OAuth credentials** (OAuth client ID + secret, authorized redirect URIs) | "Continue with Google" login button | Supabase dashboard (Authentication → Providers → Google) | 🟡 |
| 5 | **Apple OAuth credentials** (Service ID, Team ID, Key ID + private key, domain) | "Continue with Apple" login button | Supabase dashboard (Authentication → Providers → Apple) | 🟡 |

### Module 4 — Payments (Stripe)

| # | Item needed from client | What it's for | Env var / where | Status |
|---|------------------------|---------------|-----------------|--------|
| 1 | **Stripe API keys (SECRET + PUBLISHABLE) — test mode first, then live** | Create PaymentIntents; the app never holds card data | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🟡 |
| 2 | **Stripe Webhook signing secret** | Verify Stripe webhook events (`payment_intent.succeeded`, etc.) before confirming bookings | `STRIPE_WEBHOOK_SECRET` | 🟡 |
| 3 | **Register the Stripe webhook endpoint** | Stripe must call `POST /api/webhooks/stripe` (your deployed URL) with the events above | Stripe dashboard (Developers → Webhooks) | 🟡 |
| 4 | **Enable the payment methods** you want to accept on this merchant account | Card (required); optionally Link, Apple Pay, Google Pay, Klarna, PayPal via Stripe (NOT separate PayPal) | Stripe dashboard (Settings → Payment methods) | 🟡 |
| 5 | **Optional: custom recurring-donation price** | Powers the "Monthly" donate tab + Stripe Subscriptions/Checkout (deferred feature) | Stripe dashboard (Products/Prices) | ⬜ |

> ℹ️ **Note on PayPal:** The platform accepts PayPal **through Stripe** (`paypal` become a Stripe payment method). No separate PayPal developer account/API keys are needed. If the client wants standalone PayPal buttons (old design), that is a separate integration — flag it.

### Module 5 — Open Chat Queue
The queue join payment **reuses the same Stripe account** as Modules 1/4 (no new provider). The $1 minimum charge flows through the same Stripe PaymentIntent → dashboard → webhooks. Once the client enables **Module 4 Stripe keys + webhook endpoint + payment methods**, queue payments work automatically. — ⬜ (reuses Stripe above)

### Module 6 — Realtime Voice & Chat
**Realtime text chat is FULLY BUILT** (Supabase Realtime — no client action needed). Only **voice** (phone mode) is blocked:

| # | Item needed from client | What it's for | Env var / where | Status |
|---|------------------------|---------------|-----------------|--------|
| 1 | **Twilio account + credentials** (Account SID + Auth Token) | Voice calls for the conversation/session layer | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | ⬜ |
| 2 | **Twilio phone number(s) + verified caller ID** | Place/receive calls for listeners/sessions | Twilio console; `TWILIO_PHONE_NUMBER` | ⬜ |
| 3 | **Twilio (or LiveKit) — decide voice provider** | Voice calls; realtime text chat uses Supabase Realtime | SweetJS confirmation in Cross-Module notes | ⬜ |

### Module 7 — Listener Dashboard & Availability
Core portal is REAL (**queue toggle/pool/accept**, weekly availability, dashboard hours, consumer-profile view) — no client action needed. Remaining listener items depend on **Supabase Auth** (below) + Twilio:
- Listener provisioning (admin creates username + first-login password) needs **Supabase email/SMS password auth enabled** — ⬜ (scale & extensions, see Module 1)
- **Voice** sessions from the dashboard — ⬜ (Twilio above)

### Module 8 — Session & Call Management
Core lifecycle is REAL (**chat sessions, listener notes + Complete flow, auto-created session-notes documents, listener `/team-member/sessions` history, customer Documents tab**) — no client action needed for those. Remaining items block on the integrations above:
- **Post-session synopsis email** (auto after a session completes) — needs **Resend** configured (Module 1) — ⬜
- **Email/SMS reminders** (24h via Resend, 15-min SMS via Twilio) — needs **Resend** + a **Twilio SMS-capable number** (Module 6) — ⬜
- **Voice** phone sessions from the session room — needs **Twilio** (Module 6) — ⬜
- **No-show handling** + **session-notes PDF export** — pure app work, no client credential (not yet built) — 🟡

### Module 9 — Admin Interface
Most of the admin portal is REAL and needs no client action (role-guarded `/admin` dashboard, listener management + hours, sessions monitor, consumer management, reports, support/refund tickets). Remaining module-9 items depend on already-listed integrations + no extra tool for the core:
- **Refund issuance** — the UI records refund/support tickets; actually issuing the Stripe refund needs **Stripe keys/webhooks** (Module 4). Actual money refunds happen once Stripe is configured — 🟡
- **Listener account provisioning** (create auth user + first-login password for a new listener) — needs **Supabase email/SMS password auth enabled** (client dashboard toggle, Module 1) + email/Resend for invites — 🟡
- **Site-wide content (org name, crisis/support links)** — delivered in **Module 10** via `org_config` editor; no client credential — 🟡

### Module 11 — Content, Email & Marketing Templates
- (all transactional emails — booking confirm, reminders, synopsis, receipt — reuse **Resend** above) — ⬜

### Global / Platform

| # | Item needed from client | What it's for | Env var / where | Status |
|---|------------------------|---------------|-----------------|--------|
| 1 | **Production deploy target (Vercel recommended)** | Host the Next.js app + API routes; needs a domain | Vercel project + deploy domain | ⬜ |
| 2 | **Custom domain (if any)** | Branded URLs for the app + Stripe webhook + email links | DNS records | ⬜ |
| 3 | **Brand/legal** — Terms, Privacy, Cancellation Policy pages content, 501(c)(3) note | Site footer/legal copy already links these | Content files in the repo | ⬜ |

---

*Keep this list updated as modules are built. At launch, copy this entire "Client Action Required" section (with statuses flipped to actionable language) into the client email.*
