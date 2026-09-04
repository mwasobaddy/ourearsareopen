# Our Ears Are Open — System Design & Build Tracker

**Status:** 🔵 In Progress | 🟢 Done | 🟡 Blocked | ⚪ Not Started

**Architecture:** Next.js 16 (App Router) + Supabase (Postgres, Auth, Realtime, Storage) + Stripe + Twilio. Next.js API routes for server-only glue code (Stripe/Twilio/webhooks). No separate backend directory — single repo, single deploy.

> **Stack note vs `docs/SCOPE_OF_WORK.md`:** The scope doc describes a *BunJS + MongoDB + WebSocket* backend and a Mongo collection list. This tracker implements the **same features/modules** on **Next.js API routes + Postgres/Supabase + Supabase Realtime** instead — there are no separate `users`/`listeners`/`payments`/`audit_log`/`feature_flags`/`org_config` Mongo collections; those are **Postgres tables** here (users→`profiles`, payments→`payments`, content→`content_rooms`/`content_crisis`, config→`org_config`). Feature/module mapping below is source-of-truth; treat the scope doc's API paths as *suggestions* that map onto the nearest real route.

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
- [x] Admin/super-admin role-gated route protection — middleware reads `profiles.role`; `/admin` requires `admin`|`super_admin`, `/super-admin` requires `super_admin`, else redirect to `/profile`
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
- [x] Assigned listener UI — the profile "Personal Information" tab shows the customer's assigned listener name when one is set (`profiles.assigned_listener_id`)
- [x] Assigned-listener assignment API — admin/super-admin sets or clears a customer's `assigned_listener_id` via `GET/PATCH /api/admin/assigned-listener`; admin UI control on the user detail page (validates target is a customer and the value, when set, is an active listener). (SCOPE maps to `PATCH /api/users/me/assigned-listener`, built as an admin route here.)
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
- [x] Reschedule booking — `PATCH /api/bookings/[id]` + `GET /api/bookings/[id]/reschedule-options` + Reschedule button/dialog on the profile Conversations tab (frees old slot, claims a new one)
- [x] Feature-flag wiring — the booking flow honors `free_booking` (hides the "Free option") and `scheduled_phone` (hides the Phone conversation type) from `feature_flags`
- [ ] Booking hold / time-lock while paying (needs payment timing from Module 4)
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
- [ ] Create `app/api/stripe/payment-methods/route.ts` (list/add/remove saved methods) — **deferred** (Stripe **Customer objects** are already created and stored as `payments.stripe_customer_id`; only the saved-methods surface is unbuilt)
- [x] Create `app/api/webhooks/stripe/route.ts` (verify signature, `payment_intent.succeeded` / `payment_failed` / `canceled`; idempotent; confirms paid bookings)
- [x] Create `payments` table (stripe_payment_intent_id, user_id, amount_cents, type, bookings_id, status, receipt_url, stripe_customer_id) — migration `0007_payments.sql`
- [x] Wire `/payment?booking=<id>` page to create + confirm a real PaymentIntent (Stripe Elements); creates/looks up a Stripe `customer` and stores `stripe_customer_id`
- [x] Wire `/donate` page for one-time donations (recurring/monthly deferred)
- [x] Mark booking confirmed only on successful webhook (not on client success)
- [ ] Admin-initiated refunds — **deferred**: `support_tickets` records refund/support intent (migration `0014`) but the actual Stripe Refund API call is only issued once Stripe keys/welcome are configured
- [ ] Email receipts on payment — **deferred (needs Resend)**; also not yet listed for post-session synopsis email
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
- [x] "Listeners available now" stat for widget — `getListenersAvailableCount()` (counts `open_queue_enabled` listeners) wired into the `ChatQueueWidget` on `/community` and `/chat-queue`
- [ ] **Queue estimated wait time** (from SCOPE 5.1/5.2) — realtime position ✓ but wait-time estimate not yet surfaced
- [ ] **Queue decline** (from SCOPE 5.3 / 7.5) — listener declines next customer with reason; only `queue/accept` exists today
- [x] `app/api/queue/leave/route.ts` — mark my waiting/assigned entry `left`, free position; **Leave-queue** button in `QueueStatus`
- [ ] Refund on leave / after abandonment policy
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

**Status:** 🟡 (core portal real: queue, availability, hours, consumer profiles, 15hr enforcement, no-show; remaining items build on Twilio + admin listener-provisioning)

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
- [x] `/team-member/dashboard` real — weekly/monthly hours computed from `sessions` (ended_at − started_at), 15hr cap progress, today's confirmed appointments with Open Chat/Start Call; **Mark No-show** action
- [x] `/team-member/appointments` — wired to real `bookings` (upcoming scheduled appointments for the listener), replacing the mock list
- [x] **Enforce 15hr/week cap** — blocks `queue/toggle`, `queue/accept`, and `session/open` for listeners at scale when the week's session hours reach the cap
- [x] **Safety disconnect button (with reason)** — `POST /api/session/[id]/end` writes `sessions.end_reason` + sets `ended` (end-reason dialog in `SessionRoom`)
- [x] **14-minute warning + auto-end at 15 min + 5-min manual extend** — live countdown in `SessionRoom`
- [x] **Debrief time** — completing a session pauses the listener's queue availability so they take a breather (re-enable manually)
- [ ] Listener accounts: admin creates username; listener sets password on first login
- [ ] Listener-only login + redirect to team portal
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
6. The 15 hr/week cap is now **enforced** in `queue/toggle`, `queue/accept`, and `session/open` (blocked with a clear message near the cap). Completing a session pauses the listener's queue availability (debrief pause); they re-enable it manually.
7. Remaining items (listener provisioning via username+first-login password, in-session follow-up/paid email link, voice) are pending; voice additionally needs Twilio creds.

---

## Module 8: Session & Call Management

**Status:** 🟡 (session lifecycle + notes + docs + history + timing + no-show + reschedule done; reminders/post-session email blocked on client integrations)

Full session lifecycle, notes, history, documents, no-shows, reminders, post-session emails.

### TO-DO
- [x] Session lifecycle states (chat/phone via `sessions`; statuses `pending → active → completed`, or `left`/`ended`)
- [x] Session notes (`sessions.notes` + listener-only `PUT /api/session/[id]/notes`; via `SessionRoom` debrief panel)
- [x] `documents` table + `document_type` enum (session_notes/consent/other) with RLS (customer sees own, listeners/admins see assigned)
- [x] Finalize flow: `POST /api/session/[id]/complete` → `completed` + `ended_at`; auto-creates a `session_notes` `documents` row when the listener recorded notes
- [x] Listener session history page (`/team-member/sessions` — past sessions, mode, status, notes badge, open/continue link)
- [x] Customer documents tab (profile "Documents" now lists saved session-notes/consent documents from the customer's own rows)
- [x] RLS: customer sees own history; listeners see assigned; admins see all (`is_admin()` helper)
- [x] Migration `0017_sessions_notifications.sql` — `sessions.end_reason` (why a session ended) + `notifications` table (owner RLS) + `decrement_positions_after()` RPC for queue-leave
- [x] Default session timing: 15-min length, 14-min warning, auto-end, manual 5-min extension (live countdown timer in `SessionRoom`)
- [x] Safety disconnect with reason — `POST /api/session/[id]/end` records `end_reason` and ends the session; end-reason dialog in `SessionRoom`
- [x] Debrief pause — completing a session auto-pauses the listener's queue availability
- [x] No-show handling — `POST /api/bookings/[id]/no-show` sets `booking_status = no_show` and frees the `availability_slots` slot; **Mark No-show** button on the listener dashboard
- [x] Reschedule booking — `PATCH /api/bookings/[id]` (frees old slot, claims new) + `GET /api/bookings/[id]/reschedule-options` + Reschedule button/dialog in the profile "Conversations" tab
- [x] Session-notes PDF / print export — **Download / Print** action on each document card (client-side printable window)
- [x] Leave queue — `POST /api/queue/leave` (status → `left`, frees position) + Leave-queue button in `QueueStatus`
- [x] Real listeners-available count — `getListenersAvailableCount()` (counts `open_queue_enabled` listeners) wired into the `ChatQueueWidget` on `/community` and `/chat-queue`
- [x] In-app notification center — `notifications` table, `/notifications` inbox, navbar bell with live unread badge, `POST /api/notifications/read` (mark read/all), and hooks fired on queue-assign + session-complete
- [ ] Post-session email to consumer (synopsis + encouraging words) — automatic *(Blocked until Resend configured)*
- [ ] Email/SMS reminders (24h, 15 min before session): 24h via Resend, 15-min via Twilio *(Blocked until client creds)*
- [ ] No-show reported per-customer in admin reporting (metrics)

### Questions
- (none yet)

### How to test — Module 8
1. Open a chat session as a listener (`/team-member` → Open Queue → accept → `/session/<entry>?origin=queue`).
2. In the session, the listener sees a **Debrief notes** panel: type notes, click **Save notes**, click **Complete session**. Confirm the session becomes `completed`.
3. Verify the auto-created document: log in as the consumer, open Profile → **Documents**, confirm the "Session notes" card appears with the synopsis.
4. As the listener, open `/team-member/sessions` and confirm the completed session appears with the `Has notes` badge; "View / open" reopens it.
5. A session marked **End Session** transitions to `ended` (not completed/docs).
6. `sessions` RLS — confirm a customer can only see their own sessions and a listener only their assigned ones.
7. Timing is now live in `SessionRoom`: a countdown shows remaining time, a warning banner appears at ≤1 min, the listener can **Extend by 5 min**, and the session auto-ends at 15 min. The **End Session** button opens an end-reason dialog (`sessions.end_reason`). Completing a session pauses the listener's queue availability for debrief.
8. No-show (listener dashboard "Mark No-show"), booking **Reschedule** (profile Conversations), **Download/Print** on document cards, **Leave queue**, real listeners-available counts, and the **Notifications** inbox (navbar bell) are wired.
9. Reminders (24h/15-min) and the automatic post-session email remain **Blocked** pending client credentials (see client checklist).

---

## Module 9: Admin Interface

**Status:** 🟡 (core admin portal real; Stripe refunds + listener auth provisioning client-blocked)

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
- [x] Content: `content_rooms` + `content_crisis` tables with admin editors — delivered in **Module 11** (`/admin/content`), site-wide copy via Module 10 `org_config`
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
9. Blocked items: Stripe refund issuance (needs Stripe keys), listener auth user (needs Supabase password/email). Community-rooms content is now served by **Module 11** (`/admin/content` → `/community` / `/crisis`).

---

## Module 10: Super Admin

**Status:** 🟡 (core super-admin portal real; Stripe products/billing config + notifications blocked on client creds)

Platform ownership: org config, feature flags, Stripe/billing config, role assignment, audit logs.

### TO-DO
- [x] Super-admin-only route protection (`/super-admin`) — `requireSuperAdmin()` guard on every page (role must be `super_admin`)
- [x] Platform health dashboard (real revenue, user/listener/session counts, queue + open support alerts)
- [x] `org_config` table + editor (name, logo, support email, timezone, crisis links) — migration `0015`, public read / super-admin write
- [x] Feature flags (`feature_flags` table): open queue, donations, free booking, scheduled phone — editor + API + wired into queue/donate flows
- [x] Stripe/billing status page (configured?, product price, donation range, recent payments)
- [x] Role assignment (promote/demote admin, listener, super_admin) via secure route + last-super-admin / self-lockout guards
- [x] `audit_log` table for sensitive actions (role changes, deactivation, config/flag edits) + audit log page
- [~] System notifications (email/SMS provider + templates) — informational page only; blocked until Resend/Twilio
- [x] Wire `free_booking`/`scheduled_phone` flags into booking flows — `BookListenerFlow` hides the Free option when `free_booking` is off and hides the Phone card (defaulting to chat) when `scheduled_phone` is off; flags passed from the server via `getFeatureFlags()`

### Questions
- (none yet)

### How to test — Module 10
1. Log in as a `super_admin` and open `/super-admin/dashboard` — real revenue/counts/alerts; a non-super-admin or logged-out user is redirected (guard works).
2. `/super-admin/config` — edit org name/support email/timezone/logo + crisis links (JSON); persists to `org_config`; reflected on the config page (and readable by anyone).
3. `/super-admin/features` — toggle `open_queue` or `donations`; the `/chat-queue` and `/donate` pages immediately show a "temporarily disabled" state, and their APIs reject (403).
4. `/super-admin/users` — change any user's role (except yourself) and deactivate/reactivate. Demoting the last super_admin is blocked.
5. Revisit `/super-admin/audit` — the role change / deactivation / config / flag edits appear with actor, action, target, details, timestamp.
6. `/super-admin/billing` — reflects configured price + donation range + recent succeeded payments (live Stripe product editing is blocked until client provides Stripe keys).
7. `/super-admin/notifications` — read-only status; sending needs client-supplied Resend/Twilio.

---

## Module 11: Content & Marketing

**Status:** 🟡 (content management real end-to-end; **in-app transactional email sending scaffolded** — Resend configured, sending awaits a verified Resend sender domain)

Community rooms, crisis content, and the email system. Content management is fully wired; email templates are authorable. Resend credentials have been provided by the client and Supabase Auth SMTP configured; in-app transactional email sending (welcome, booking, receipt, synopsis, reminders) is **scaffolded and wired** on the Resend SDK (`lib/email.ts`) but **safely no-ops** until a **verified Resend sender domain** is provided.

### TO-DO
- [x] `content_rooms` table + API + admin editing (migration `0016`) — public read / admin write (RLS via `is_admin()`)
- [x] `content_crisis` table + API + admin editing (migration `0016`) — public read / admin write
- [x] `/admin/content` real-data editor for both rooms + crisis resources (create/edit/delete, toggle active, sort; audit-logged)
- [x] `/community` reads active rooms from `content_rooms` (icon map + default member/active/recent metadata; falls back gracefully if empty)
- [x] `/crisis` reads active resources from `content_crisis` (phone/availability/primary rendering)
- [x] `email_templates` table + seed (welcome, booking confirm, reminder, receipt, synopsis) — migration `0016`, super-admin editable
- [x] `/super-admin/email-templates` editor (subject/body/description; placeholders documented) — ready for when Resend is configured
- [x] **Resend configured** by client (API key in `RESEND_API_KEY`; Supabase Auth SMTP → Resend verified in dashboard) — see **Email Delivery Setup** below
- [x] **In-app notification center** — built (`notifications` table, `/notifications` inbox, navbar bell with unread badge, mark-read API) — no client credential
- [x] **In-app transactional email sending (Resend SDK):** `welcome` (register → `/api/email/welcome`), `booking_confirm` + `session_receipt` (Stripe webhook), `session_synopsis` (session complete), `booking_reminder` (`/api/email/reminders` 24h/15-min cron) — via `lib/email.ts`; sends no-op until `RESEND_API_KEY`
- [ ] **Email actually delivering** — blocked until a **verified Resend sender domain** is provided (`.vercel.app` sender fails DNS verification). Until then the scaffold no-ops safely. See **Email Delivery Setup**.
- [ ] Admin send-email / campaign (SCOPE 11.6 `POST /api/admin/send-email`, list segments) — ability to email team members and consumers (ongoing notices); not yet tracked/built

### Questions
- (none yet)

### How to test — Module 11
1. Log in as an `admin` (or `super_admin`) and open `/admin/content` — edit a community room title/description, change its sort order, and (de)activate it; the public `/community` page reflects the change immediately (inactive rooms are hidden).
2. `/admin/content` crisis section — edit a hotline's name/phone/availability or mark it primary; the public `/crisis` page updates (inactive resources hidden).
3. Create a new room or crisis resource; it appears in the admin list and on the public page. Delete one and it disappears.
4. Log in as a `super_admin` and open `/super-admin/email-templates` — author subject/body copy for each transactional template (saved to `email_templates`).
5. **Auth email delivery is now LIVE** (verification + password reset) once Supabase Auth SMTP → Resend is configured with a **verified sender domain** (see **Email Delivery Setup**). In-app transactional emails (welcome, booking, receipt, synopsis, reminders) are **scaffolded + wired** via the Resend SDK in `lib/email.ts` and no-op until `RESEND_API_KEY` + a verified domain are in place.

---

## Cross-Module Decisions & Architecture Notes

This section captures decisions that span multiple modules. Revisit as you build.

- [ ] Confirm realtime approach: Supabase Realtime for chat/queue; Twilio or LiveKit for voice
- [ ] Confirm file storage: Supabase Storage buckets (`avatars`, `documents`)
- [x] Confirm email provider: **Resend** — auth emails via **Supabase Auth custom SMTP → Resend**; transactional/app emails via the **Resend SDK** in `lib/email.ts` (see **Email Delivery Setup** below)
- [ ] Confirm RLS is the primary authorization mechanism everywhere
- [ ] Confirm Next.js API routes used only for server-secret glue (Stripe/Twilio/webhooks)
- [ ] Confirm deployment: Vercel (frontend+routes) + managed Supabase (DB/auth/storage/realtime)

### Email Delivery Setup (resolved)

> Two independent email channels. Auth emails are sent by **Supabase Auth**, transactional emails by **our app**. Both route through **Resend**.

**1. Auth emails — verification, password reset, confirm signup** (configured in Supabase Dashboard, not code):
1. Resend → **Domains** → **Add Domain**, paste the requested domain, and add the DNS records Resend gives you to your DNS host. Then **Verify**. The sender must be on this verified domain or SMTP won't send.
2. Resend → **API Keys** → create a key. (For SMTP below, the **API key** doubles as the SMTP password.)
3. Supabase Dashboard → **Authentication → Email → SMTP Settings** → toggle **"Enable custom SMTP" ON**:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL, recommended)
   - **Username:** `resend`
   - **Password:** your Resend **API key**
   - **Sender email:** `<from-address>@<verified-domain>` (e.g. `noreply@ourearsareopen.org`)
   - **Sender name:** e.g. `Our Ears Are Open`
   - Save.
4. Supabase Dashboard → **Authentication → Email → Templates**: edit each template's subject/body + sender. Default template variables (Supabase uses `{{ .ConfirmationURL }}` in the **HTML body** and `{{ .ConfirmationURL }}` for confirm; other templates use `{{ .ResetURL }}`, `{{ .SiteURL }}`, `{{ .Email }}`).
   - **Confirm signup** example HTML body:
     ```html
     <h2>Confirm your email address</h2>
     <p>Follow the link below to confirm this email address and finish signing up.</p>
     <p><a href="{{ .ConfirmationURL }}">Confirm email address</a></p>
     ```
   - The mailer appends the footer (resend/company name button) automatically via the **`{{ .Footer }}`** / template options — you only author the content above the footer.
5. Test: create a new account → you receive the verification email.

**2. Transactional/app emails — welcome, booking confirm, receipt, session synopsis, reminder** (built in code, Resend SDK):
- Client provides the **Resend API key** → stored in `RESEND_API_KEY`.
- `lib/email.ts` reads a template from the `email_templates` table + `org_config` (org name / from-address), fills `{{ placeholders }}`, and sends via the Resend SDK.
- Integration hooks: `welcome` on registration; `booking_confirm` + `session_receipt` in the Stripe webhook; `session_synopsis` on session complete; `booking_reminder` via a cron-triggerable route.

**Resolved:** The "sender must be on a verified Resend domain" prerequisite is met by step 1. If the dashboard SMTP test fails with a DNS/verification error, the domain is not yet verified in Resend.
>
> ⚠️ **Gotcha (2026-09):** A `*.vercel.app` (or other free auto-assigned) sender fails with `550 ... domain is not verified` because you do **not** control its DNS, so it can't be verified in Resend. A **real, DNS-controlled public domain** is required for sending to arbitrary recipients. Until one is provided, Resend's **sandbox sender** (`onboarding@resend.dev`, delivers only to the Resend account email) can be used to validate the SMTP pipeline. Full client guide: `docs/RESEND_EMAIL_SETUP_GUIDE.md`.

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
| 3 | **Resend API key + verified sending domain** | Sends verification / password-reset emails | `RESEND_API_KEY` + a domain verified in Resend | 🟢 (API key provided; SMTP configured — confirm domain DNS verification) |
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
Core portal is REAL (queue toggle/pool/accept, weekly availability, dashboard **hours + 15hr/week cap enforcement**, consumer-profile view, **no-show action**) — no client action needed. Remaining listener items depend on **Supabase Auth** (below) + Twilio:
- Listener provisioning (admin creates username + first-login password) needs **Supabase email/SMS password auth enabled** — ⬜ (scale & extensions, see Module 1)
- **Voice** sessions from the dashboard — ⬜ (Twilio above)

### Module 8 — Session & Call Management
Core lifecycle is REAL (**chat sessions, listener notes + Complete flow, auto-created session-notes documents, listener `/team-member/sessions` history, customer Documents tab, 15-min session timing with 14-min warning + auto-end + extend, safety-disconnect with recorded reason, no-show handling, booking reschedule, session-notes Download/Print, leave-queue, real listeners-available counts, in-app notifications**) — no client action needed for those. Remaining items block on the integrations above:
- **Post-session synopsis email** (auto after a session completes) — needs **Resend** configured (Module 1) — ⬜
- **Email/SMS reminders** (24h via Resend, 15-min SMS via Twilio) — needs **Resend** + a **Twilio SMS-capable number** (Module 6) — ⬜
- **Voice** phone sessions from the session room — needs **Twilio** (Module 6) — ⬜

### Module 9 — Admin Interface
Most of the admin portal is REAL and needs no client action (role-guarded `/admin` dashboard, listener management + hours, sessions monitor, consumer management, reports, support/refund tickets). Remaining module-9 items depend on already-listed integrations + no extra tool for the core:
- **Refund issuance** — the UI records refund/support tickets; actually issuing the Stripe refund needs **Stripe keys/webhooks** (Module 4). Actual money refunds happen once Stripe is configured — 🟡
- **Listener account provisioning** (create auth user + first-login password for a new listener) — needs **Supabase email/SMS password auth enabled** (client dashboard toggle, Module 1) + email/Resend for invites — 🟡
- **Site-wide content (org name, crisis/support links)** — delivered in **Module 10** via `org_config` editor; no client credential — 🟡

### Module 10 — Super Admin
Most of the super-admin portal is REAL and needs no client action (role-guarded `/super-admin` dashboard, org config editor, feature flags, users/roles, audit log). Remaining module-10 items depend on client credentials:
- **Stripe / billing product & price editing** — products/prices live in Stripe, not the DB; editing them is a Stripe Dashboard task once **Stripe keys + webhook** are configured (Module 4) — 🟡
- **System notifications (email/SMS)** — the page is informational; actually sending needs **Resend** (Module 1) and **Twilio** (Module 6) — 🟡

### Module 11 — Content, Email & Marketing Templates
Community rooms + crisis content management is REAL and needs no client action (admin-editable via `/admin/content`, shown live on `/community` and `/crisis`). Email **templates** are authorable by super-admin (module 11 section, `/super-admin/email-templates`). Delivery uses **Resend**:
- **Resend API key** — provided by client → `RESEND_API_KEY` — ✅
- **Supabase Auth SMTP → Resend** — configured in the dashboard (see **Email Delivery Setup**) for verification + password reset — ✅
- **Verified Resend sender domain** — must be added + DNS-verified in Resend before SMTP can send (prerequisite; confirm the domain is verified if a dashboard SMTP test fails) — 🟡
- **In-app transactional email sending** (welcome, booking, receipt, synopsis, reminder) — **scaffolded + wired** via the Resend SDK in `lib/email.ts` (`/api/email/welcome`, `/api/email/reminders`, Stripe webhook, session-complete); no-ops until `RESEND_API_KEY` — ✅ (wired)
- **In-app notification center** — built (`notifications` table, `/notifications` inbox, navbar bell with unread badge, mark-read API) — no client credential — ✅

### Global / Platform

| # | Item needed from client | What it's for | Env var / where | Status |
|---|------------------------|---------------|-----------------|--------|
| 1 | **Production deploy target (Vercel recommended)** | Host the Next.js app + API routes; needs a domain | Vercel project + deploy domain | ⬜ |
| 2 | **Custom domain (if any)** | Branded URLs for the app + Stripe webhook + email links | DNS records | ⬜ |
| 3 | **Brand/legal** — Terms, Privacy, Cancellation Policy pages content, 501(c)(3) note | Site footer/legal copy already links these | Content files in the repo | ⬜ |

---

*Keep this list updated as modules are built. At launch, copy this entire "Client Action Required" section (with statuses flipped to actionable language) into the client email.*
