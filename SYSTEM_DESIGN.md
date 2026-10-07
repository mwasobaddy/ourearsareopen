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
- [x] **Verify all role-based nav links render correctly in navbar** — every authenticated user gets **Profile**; `listener`→Team Portal, `admin`→Admin, `super_admin`→Super Admin (unified desktop/mobile via shared portal config); login `redirectForRole` targets match each portal

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

The book-listener multi-step flow: choose phone/chat type, concern, listener preferences, date/time, then payment. Creates a booking that persists in the DB, notifies listeners, and ends with a listener assigned and a live session the customer can join.

### TO-DO
- [x] `bookings` table (user_id, listener_id, type, concern, preferences jsonb, slot_start/end, status pending/confirmed/completed/cancelled/no_show, payment_intent_id) + RLS (migration `0006`)
- [x] `availability_slots` table (listener_id, starts_at, ends_at, is_booked, booking_id) + RLS (migration `0006`)
- [x] RLS: customers own their bookings; listeners see assigned; admins see all (via `is_admin()`)
- [x] `/book-listener` converted to `BookListenerFlow` client component — collects type, payment option (paid/free), concern (5-word min), listener preferences, date + time, and creates a real `bookings` row on "Confirm Booking"
- [x] Booking page server-guarded: incomplete profile → redirect to `/profile/setup?next=/book-listener`
- [x] List upcoming + past bookings on `/profile` Conversations tab (real data) with Cancel action
- [x] End-to-end verified: create booking → list → cancel → RLS isolation → availability slots (via confirmed test user; cleaned up)
- [~] Reschedule booking — UI, dialog and both endpoints exist, but **it cannot succeed**: `reschedule-options` lists from `availability_slots`, and nothing in the codebase ever inserts a row into that table (it has 0 rows). Always returns an empty list. See **Module 16**
- [x] Feature-flag wiring — the booking flow honors `free_booking` (hides the "Free option") and `scheduled_phone` (hides the Phone conversation type) from `feature_flags`
- [ ] Booking hold / time-lock while paying (needs payment timing from Module 4)
- [x] Booking confirmations via email — free bookings confirm + email on creation; paid bookings confirm + email from the Stripe webhook
- [x] Server-side creation — `POST /api/bookings` replaces the old client-side insert: validates the slot (future, ≥30 min lead, no overlap with the customer's own bookings), honors the `free_booking` / `scheduled_phone` flags, and confirms free bookings immediately (nothing used to move them out of `pending`)
- [x] Fixed slot parsing — the old `new Date("2026-10-07T9:00AM:00")` produced an Invalid Date and threw on every submit; slots are now parsed into a real local Date and sent as ISO
- [x] **Listener assignment** (the piece that made booked sessions impossible) — migration `0020_booking_assignment.sql` adds `assigned_at` / `reminder_sent_at`, the open-request index, an RLS policy letting listeners read unassigned confirmed bookings, and a policy letting a customer read their matched listener's profile
- [x] Open requests feed — `GET /api/bookings/open` + `OpenBookingRequests` panel on `/team-member/appointments` (concern text, preferences, time; polls every 30 s)
- [x] Accept flow — `POST /api/bookings/[id]/accept` (listener only, 15 hr/week cap, no double-booking, claims a matching availability slot) with `lib/booking-ops.ts` holding the shared assignment rules
- [x] Admin assignment — `PATCH /api/admin/bookings/assign` + `/admin/bookings` page listing every booking with status, payment option, preferences, and an assign/clear control
- [x] Customer join path — profile Conversations tab shows the matched listener's name, a "Join Call"/"Join Chat" button from 15 min before the slot until it ends, "Waiting for a listener to accept" while unmatched, and a "Complete payment to confirm" link for unpaid bookings
- [x] Session completion closes the booking — completing a session marks the originating booking `completed`; ending early marks it `cancelled` (previously bookings stayed `confirmed` forever)
- [x] Free conversations are never charged — `POST /api/stripe/payment-intent` rejects free bookings and already-paid bookings with `409`
- [x] Reminders are scheduled — `vercel.json` cron → `GET /api/email/reminders` (daily at 13:00 UTC, 24 h lookahead, `reminder_sent_at` idempotency, `CRON_SECRET` auth). The project is on Vercel Hobby, which allows only one cron run per day — an hourly schedule is rejected by the platform with "Hobby accounts are limited to daily cron jobs". Hourly reminders need a Pro plan or an external trigger (GitHub Actions / Supabase pg_cron calling the same endpoint; it is safe to run hourly because of the `reminder_sent_at` stamp)
- [x] End-to-end verified in the browser: free booking → listener notified → accept → customer sees the match + join button → live chat between both parties → notes → complete → booking `completed` + notes document + notification. Overlap, past-slot, too-soon, and free-charge guards all return the right errors. Test data removed afterwards.

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
- [x] **Queue estimated wait time** (from SCOPE 5.1/5.2) — realtime position ✓ + dynamic estimate surfaced in `QueueStatus` (`estimateWaitMinutes(position, listenersAvailable)`: pos 1 → ~1min, else position × avg-session / available-listeners)
- [x] **Queue decline** (from SCOPE 5.3 / 7.5) — listener declines the next customer with a reason; `POST /api/queue/decline` marks the entry `declined` (new enum value), records `decline_reason`, frees the slot, notifies the consumer; Decline button + reason dialog in the team-member queue panel
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

**Status:** 🟡 (realtime chat fully working; voice code complete but the Twilio account is closed)

In-session chat (real-time text) and voice calls (phone appointments). Voice is a Twilio click-to-call bridge initiated by the listener — implemented, but 🔴 blocked on the Twilio account itself being active. Chat via Supabase Realtime — fully working now.

### TO-DO
- [x] Migration `0011_realtime_sessions.sql` — `sessions` table (mode chat/phone, status pending/active/left/ended/completed, origin from queue_entry_id or booking_id, notes, started_at/ended_at) + RLS (participants read/update, admins all) + realtime publication
- [x] `messages` table (session_id, sender_id, body) + RLS (participants read/insert) + realtime publication
- [x] `app/api/session/open/route.ts` — open/fetch a session from a queue entry or booking (participant-guarded; marks queue entry `connected`)
- [x] Realtime chat UI in `/session/[id]` (`components/session/session-room.tsx`) — live messages, send, history, participant status notifications ("participant left")
- [x] Session state notifications ("participant left", "you left") surfaced as system chips in the chat feed
- [x] `QueueStatus` assigned view now links into `/session/<entry>?origin=queue`
- [x] Voice is a PSTN click-to-call bridge, not an in-browser call — `POST /api/twilio/call` dials the consumer from the Twilio number and bridges to the listener's own phone (matches "only the team member places the call", and needs no TwiML app or browser SDK). `DELETE /api/twilio/call` hangs up; the Call SID is stored on `sessions.room_id`
- [x] Phone-mode UI in the session room — listener gets "Call consumer" / "Hang up"; the customer is told to expect a call; chat stays available as a fallback
- [x] Credential resilience — tries the API key pair, falls back to the account auth token, and returns an actionable message when the Twilio account itself is unavailable
- [ ] Voice calls end-to-end — 🔴 **blocked: the Twilio account `AC9e947d…` is closed (`status 4`, error 20003)**. No code change fixes this; the account must be reactivated or replaced (see `docs/CLIENT_ACTION_REQUIRED.md` §3)
- [ ] Consumer phone verification — required by Twilio trial accounts before any number can be called

### Questions
- (none yet)

### How to test — Module 6
1. On `/session/[id]?origin=queue`, opening two browser tabs as customer + listener shows messages appearing in realtime via Supabase Realtime (no page refresh).
2. A `sessions` row is created (`status = active`, `started_at` set) when opened; its linked queue entry flips to `connected`.
3. Only the two participants can read/send messages (postgres RLS); guests/non-participants get 403.
4. Clicking "Leave" sets the session to `left` and a system chip appears on the other side; "End Session" sets `ended` and disables the input.
5. Voice (phone mode) shows a "Call consumer" button for the listener; placing a call returns "Voice calling is unavailable — the Twilio account needs to be reactivated" until the account is fixed (see `docs/CLIENT_ACTION_REQUIRED.md` §3).

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
- [~] In-session follow-up booking — dialog and `POST/GET /api/bookings/follow-up` exist, but the listener's slot list comes from `availability_slots`, which is always empty, so the dialog always says "You have no open times available" even after availability has been set. **Cannot complete a follow-up booking.** See **Module 16**
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
7. Remaining items (listener provisioning, voice) are pending. In-session follow-up booking is **not** usable yet despite the dialog existing, because the underlying slot list is never populated (see **Module 16**). The verified Resend domain is now in place, so the paid follow-up email path is ready once slots exist.

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
- [~] Reschedule booking — UI and endpoints exist but are **non-functional** for the same reason as Module 3: no `availability_slots` rows are ever created. See **Module 16**
- [x] Session-notes PDF / print export — **Download / Print** action on each document card (client-side printable window)
- [x] Leave queue — `POST /api/queue/leave` (status → `left`, frees position) + Leave-queue button in `QueueStatus`
- [x] Real listeners-available count — `getListenersAvailableCount()` (counts `open_queue_enabled` listeners) wired into the `ChatQueueWidget` on `/community` and `/chat-queue`
- [x] In-app notification center — `notifications` table, `/notifications` inbox, navbar bell with live unread badge, `POST /api/notifications/read` (mark read/all), and hooks fired on queue-assign + session-complete
- [ ] Post-session email to consumer (synopsis + encouraging words) — automatic *(Blocked until Resend configured)*
- [ ] Email/SMS reminders (24h, 15 min before session): 24h via Resend, 15-min via Twilio *(Blocked until client creds)*
- [x] No-show reported per-customer in admin reporting — `/admin/reports` shows a no-shows-this-month aggregate + a per-customer breakdown (tallied from `bookings.status = no_show`, repeat offenders highlighted, linking to each user)

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
- [~] Listener management: list real listeners and deactivate/reactivate both work. **Add is broken**: `POST /api/admin/listeners` returns 500 because the `auth.users` signup trigger already creates the profile row and the route then tries to insert a second one (primary key collision). The account is created but left with role `customer`. See **Module 16**
- [x] Monitor listener hours (weekly/monthly, 15hr cap) + hours — real from `sessions` (`lib/admin-data.ts`)
- [x] Monitor chat + phone sessions (list, duration, status, consumer/listener) + status/type filters (`SessionsFilter`)
- [x] User list (consumers): search, view profile, deactivate/reinstate (`is_active`)
- [x] Reports: sessions, revenue, new customers, listener utilization (users + hours/cap) — live aggregates
- [x] Refunds + support: `support_tickets` table (refund/support, status, internal notes) + create/resolve via API
- [x] `is_active` column + `support_tickets` table (migration `0014`) + RLS (admins only)
- [~] Listener provisioning (auth user + first-login password) — blocked until client enables Supabase password auth + email. The "first-login password" step has no implementation: `POST /api/admin/listeners` creates a passwordless auth user and no invite is sent, so credentials are shared manually. Tracked properly in **Module 12** (hire action → `inviteUserByEmail`)
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
9. Blocked items: Stripe refund issuance (needs Stripe keys), listener auth user (needs Supabase password/email). Note: a listener added here cannot set their own password yet — see **Module 12**. Community-rooms content is now served by **Module 11** (`/admin/content` → `/community` / `/crisis`).

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

**Status:** 🟡 (content management real end-to-end; **in-app transactional email sending + admin campaign email scaffolded** — Resend configured, sending awaits a verified Resend sender domain)

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
- [x] Admin send-email / campaign (SCOPE 11.6) — `GET /api/admin/email-segments` (list segments + recipient counts) + `POST /api/admin/send-email` (campaign/notice to customers, listeners, team, or everyone; emails no-op until a verified Resend domain, and recipients also get an in-app notification); **Send email** dialog on `/admin/reports`

### Questions
- (none yet)

### How to test — Module 11
1. Log in as an `admin` (or `super_admin`) and open `/admin/content` — edit a community room title/description, change its sort order, and (de)activate it; the public `/community` page reflects the change immediately (inactive rooms are hidden).
2. `/admin/content` crisis section — edit a hotline's name/phone/availability or mark it primary; the public `/crisis` page updates (inactive resources hidden).
3. Create a new room or crisis resource; it appears in the admin list and on the public page. Delete one and it disappears.
4. Log in as a `super_admin` and open `/super-admin/email-templates` — author subject/body copy for each transactional template (saved to `email_templates`).
5. **Auth email delivery is now LIVE** (verification + password reset) once Supabase Auth SMTP → Resend is configured with a **verified sender domain** (see **Email Delivery Setup**). In-app transactional emails (welcome, booking, receipt, synopsis, reminders) are **scaffolded + wired** via the Resend SDK in `lib/email.ts` and no-op until `RESEND_API_KEY` + a verified domain are in place.

---

## Module 12: Recruitment & Hiring (Job Postings → Application → Hire)

**Status:** ⚪ Not Started (advertising copy exists; **application capture is missing — nothing an applicant submits is ever received**)

> **Scope note:** applicant tracking was **never in `docs/SCOPE_OF_WORK.md`**. Module 9.2 (`:141`, `:742`) scoped hiring as *"add or remove team members in backend"* only. `/join-team` and `/workforce-apply` were carried over from the frontend prototype, where every form was decorative — so the advertising half was built and the receiving half never was. This module is **new scope**, not a bug fix, and is documented here so it is agreed before any code is written.

Recruitment pipeline: publish a role → apply → review → interview → offer → hire (1099 onboarding).

### Current state — what exists
- [x] `/join-team` "Open Positions" (`#open-roles`) — six role cards rendered from a **hardcoded array** (`app/join-team/page.tsx:55-104`): Therapists, Licensed Therapists, Counselors, Community Outreach Manager, Social Media Management, Team Communication Member. Shows department / type / location badges + the 1099 terms ($10.99 per conversation, headsets, training, weekly pay)
- [x] `/workforce-apply` — full application UI (name, email, résumé upload, one-minute video link/upload, written intro)
- [x] `/volunteer` — volunteer application UI
- [x] `/admin/listeners/new` + `POST /api/admin/listeners` — create a team member (auth user + `profiles.role = 'listener'`)
- [x] Admin nav: Dashboard, Listeners, Bookings, Sessions, Users, Content, Reports, Support

### The two application pages, in detail

Both are public, unauthenticated, and **identical in structure** — same field ids, same file inputs, no `"use client"`, no state, no validation, no `action`, no `onSubmit`, no fetch. `/workforce-apply` and `/volunteer` differ only in the surrounding copy and one hidden value.

| | `/workforce-apply` | `/volunteer` |
|---|---|---|
| Purpose | paid 1099 role | volunteer listener |
| Context panel | 1099 terms, Wi-Fi assistance offer, headsets, training, weekly pay | 501(c)(3) Florida charitable org framing |
| Required copy | non-discrimination, "a criminal background does not stop you", 18+ | non-discrimination, "a criminal background does not stop you", 18+ |
| Hidden field | `applicationType=workforce` (`:139-144`) | `applicationType=volunteer` (`:90-95`) |
| Submit | `:191` — **does nothing** | `:141` — **does nothing** |

Fields collected by both: first name (required), last name (required), email (required), résumé (labelled *required* but **no `required` attribute** — `:151` / `:103`), intro video link, intro video file, written intro. That is the entire payload, and none of it is transmitted.

**Inbound links:** `/workforce-apply` is reachable from 3 places, all in `app/join-team/page.tsx` (`:179` hero "Become a Listener", `:268` every "View & Apply" button, `:282` "Fill out the form"). `/volunteer` from 5 places (join-team hero `:173` and `:347`, footer, home donate section, home services section) — it is the **most-trafficked entry point** of the two, being in the site footer.

**Defects beyond "it doesn't submit":**
- **Résumé is not actually required** despite the label on both pages
- **No phone number** — and `profiles.phone` is required for phone conversations (the Twilio call path refuses without it), so every hire would need it added by hand
- **No age confirmation** — both pages state "You must be 18+" but nothing captures or checks a date of birth
- **No consent to be contacted**, and no link to `/privacy` on either page, while both ask for a résumé and an intro video (applicant PII)
- **The stated hiring priorities are never captured** — the pages say they prioritise elderly, veterans, single parents, college students and second-chancers, but ask none of that
- **No role field** (see the enum gap below) and no `opening` reference
- **Accessibility:** the intro-video group's `<Label>` has no `htmlFor`, and `videoLink` / `videoFile` / `writtenIntro` have no associated labels — a file input's placeholder is not an accessible name, so the video upload has none
- **No dedupe** — the same person can submit both a volunteer and a paid application, or the same one repeatedly
- **Nothing to build on:** both are static server components, so a future fix is a client component + API route, not a patch to existing logic

### Gaps — 🔴 blockers (the process stops here today)
- [ ] **`/workforce-apply` submits nowhere.** `app/workforce-apply/page.tsx:110` is `<form className="space-y-5">` — no `action`, no `onSubmit`, not a client component. Submitting does a GET navigation back to the same URL and **discards every field including the résumé and video file**. The page re-renders as if nothing happened; there is no confirmation and no error
- [ ] **`/volunteer` has the identical defect** — `app/volunteer/page.tsx:62`, same bare `<form>`
- [ ] **No `applications` table** in any migration — nowhere to record an application or its files
- [ ] **No application API route** — nothing accepts the submission
- [ ] **No file storage for applications** — only the `avatars` bucket exists; nowhere for a résumé or intro video
- [ ] **No confirmation to the applicant, no notification to admins** — a prepared applicant believes they applied when nothing reached either side
- [ ] **No admin review surface** — nothing lists applicants, so applications are invisible to the business
- [ ] **New hires cannot sign in.** `POST /api/admin/listeners` creates the auth user with `email_confirm: true` and **no password**; `inviteUserByEmail` / `generateLink` appear nowhere in the codebase. `/admin/listeners/new` promises *"They will set their password on first sign-in"* — that flow does not exist, so the admin must hand over credentials out of band

### Gaps — 🟡 high
- [ ] **No role identity on the application.** Every "View & Apply" is a bare `<Link href="/workforce-apply">` (`join-team/page.tsx:268`, plus the "Fill out the form" link at `:282`) — no opening id in the URL or query. The form has no role/position field, only a hidden `applicationType=workforce` that nothing reads, so six job adverts would produce one undifferentiated pile
- [ ] **The role enum cannot express the advertised roles.** `public.user_role` is `customer | listener | admin | super_admin` (`0001_auth_users.sql:55`). Therapists, Licensed Therapists, Counselors, Outreach Manager and Social Media all collapse to `listener` — no credential field, licence number, issuing state or expiry anywhere
- [ ] **No status pipeline, no interview step, no reviewer notes** — `submitted → screening → interview → offer → hired/rejected` does not exist
- [ ] **No applicant-facing status** — applicants cannot see where they stand, so "did you get my application?" lands with the business
- [ ] **"Training provided" is advertised on three pages** (`join-team`, `workforce-apply`, `volunteer`) with **no training module** and no way to record that someone completed it

### Gaps — 🟡 medium
- [ ] **Roles are hardcoded in a page component** — cannot be added, edited, closed, or dated without a code deploy; no open/closed state, applicant count, salary, requirements, posted date, or deadline; no per-role detail page
- [ ] **No 1099 agreement, W-9, or consent record** — the `documents` table has a `consent` type that nothing writes
- [ ] **No background-check record** for any role
- [ ] **No offboarding record** — `is_active` toggles access, but there is no exit reason, date, or note (Module 9 covers deactivation only)
- [ ] **"Team Communication Member" duplicates the listener path** — the same hero offers "View Open Positions", "Sign Up as Volunteer" and "Become a Listener", so the advert list mixes paid clinical roles, a comms role and the direct-support listener job

### Interim workaround (no code — recommended while this is unscheduled)
- [ ] Put a free external form (e.g. Google Form) behind "View & Apply" and "Sign Up to Volunteer" so applications arrive by email today, with a spreadsheet tracking each person's stage. Files live with the provider and there is no status tracking — a genuine stopgap, replaced by the work below.

### Proposed build — awaiting client confirmation, NOT started
- [ ] `job_openings` table (title, department, employment type, location, pay, description, responsibilities, requirements, status open/closed, posted_at, closes_at) + RLS; `/join-team` renders from it; super-admin CRUD at `/super-admin/jobs`
- [ ] Per-opening detail page + `/workforce-apply?opening=<id>` so the applied-for role is always known; free-text "no suitable role" path retained
- [ ] `applications` table (opening_id nullable, `type` workforce/volunteer, full_name, email, phone, resume_path, intro_video_path, intro_text, `status` submitted/screening/interview/offer/hired/rejected, reviewer notes, reviewed_by, reviewed_at, created_at) + RLS (admins all; a signed-in applicant reads only their own)
- [ ] Private `applications` storage bucket for résumés and intro videos (service-role upload, no public URLs)
- [ ] `POST /api/applications` + real client form — both pages become client components sharing one form component; validation, file size/type limits, honeypot + rate limiting
- [ ] Add the fields the pages imply but never capture: phone (needed for phone sessions), 18+ confirmation, consent to be contacted, an accessible name for the video upload, enforced `required` on the résumé, and a `/privacy` link
- [ ] Applicant confirmation email with a reference number, plus an in-app/email notification to admins (reuses `lib/email.ts` + `createNotification`)
- [ ] `/admin/applicants` pipeline — filter by status/role/opening, read the résumé, advance status, record a rejection reason, audit-logged
- [ ] Applicant status page at `/application/status?token=<signed>` — read-only progress, no account needed
- [ ] Hire action: `POST /api/admin/applicants/[id]/hire` → `assignBookingToListener`-style role promotion + `inviteUserByEmail` so the new team member sets their own password; replaces the manual credential handover
- [ ] Role/credential support: `listener` specialisations (clinical / outreach / comms) + licence number, issuing state, expiry, verified flag on `profiles`; surfaced on `/admin/listeners/[id]`
- [ ] 1099 agreement + consent captured as `documents` rows (existing `document_type` values `consent` / `other`), downloadable by the applicant and staff
- [ ] Training tracker: `training_modules` + per-listener completion, so "training provided" becomes verifiable
- [ ] Offboarding: deactivate with a recorded reason/date on the profile
- [ ] Optional: auto-close an opening once hired; weekly digest of new applicants to admins

### Questions
- ❓ Confirm the six advertised roles as they stand, or combine/remove some (Therapists vs Licensed Therapists vs Counselors overlap heavily)
- ❓ Should volunteer applications run through the same stages, or a lighter track (received → contacted → active volunteer)?
- ❓ Should applicants see their own status, or stay private for now?
- ❓ Should an opening auto-close when someone is hired?
- ❓ Are licensed roles genuinely separate from `listener`, or is one `listener` role with a "licensed" flag enough? (Affects whether the enum changes or a specialisation column is added.)
- ❓ Who reviews applications — one admin, or several with notes visible to each other?
- ❓ Background checks: required for any role, and who performs them?

### How to test — Module 12
_(Not applicable until this module is built. The steps below are the acceptance checks to run once it is.)_
1. Open `/join-team#open-roles` — roles come from the database; closing an opening at `/super-admin/jobs` removes it from the public list without a deploy
2. Click **View & Apply** on one role → the detail page and the apply form both carry that opening id
3. Submit the form with a résumé file → a row appears in `applications` with the correct `opening_id`, and the file is retrievable from the private bucket by staff and by the applicant only
4. Reload the page → the application is gone from the form (no double submit); no application row is created by an empty submit
5. The applicant receives a confirmation email with a reference number; admins receive a notification; the applicant appears in `/admin/applicants`
6. Move the applicant New → Looking at → Interview → Offer → Hired; each step emails the applicant and appears in their status page
7. Open `/admin/applicants` as an `admin`, then as a `listener` (redirected), then logged out (redirected); a customer can read only their own application
8. Reject with a reason → the applicant sees the reason on their status page and admins see who rejected it and when
9. Press **Hire** → the profile becomes `listener` (or the specialisation), the new hire receives a password-set email, and can sign in without the admin sharing any credential
10. Re-submit the same form repeatedly → rate limited, and no duplicate rows appear

---

## Module 13: Contact & Enquiries (Public Contact Form)

**Status:** ⚪ Not Started (form UI exists; **nothing sent from it is ever received**)

> **Scope note:** `/contact` appears in `docs/SCOPE_OF_WORK.md:625` in the route inventory as "Contact form", and `:57` records that the prototype's pages were "forms only" — but **no module or phase in the scope covers receiving, storing, or answering an enquiry**. Like **Module 12**, the page was built and the receiving half never was. This is new scope, documented for agreement before code is written.

The public "get in touch" surface: a visitor sends a message, the business receives and answers it.

### Current state — what exists
- [x] `/contact` form UI — first name, last name, email, phone (optional), topic select (general / services / booking / volunteer / donations / partnership / other), message (`app/contact/page.tsx:98-176`). One of **three dead public data forms** — see Module 12 for `/volunteer` + `/workforce-apply`; all three share the same root cause (prototype `<form>` markup never wired to a receiver)
- [x] `/contact` supporting content — Email Us card (mailto), address, business hours, "we operate remotely" card, remote-first photo callout, and a crisis box that correctly routes to `/crisis`
- [x] `/crisis` — real data from `content_cris + hotline links` (Module 11); the safety destination on the same page does work
- [x] `lib/site.ts:30` — `site.email` (`hello@ourearsareopen.org`), the only contact path that actually functions, wired to the mailto card and the site footer
- [x] Notification + email plumbing to reuse — `createNotification` (`lib/session-ops.ts`) and `lib/email.ts`

### Verified behaviour (tested on production 2026-10-06)
Submitting "Send Message" performs a plain GET navigation back to `/contact`. Network log: **zero POST requests**. The five inputs carry no `name` attributes, so nothing is even serialised — the URL stays `/contact` with no query string and the fields come back empty. There is **no confirmation, no error, and no loading state**, so a visitor gets no indication anything failed.

### Gaps — 🔴 blockers
- [ ] **`/contact` submits nowhere.** `app/contact/page.tsx:98` is `<form className="mt-8 space-y-6">` — no `action`, no `method`, no `onSubmit`, and the page is a server component with no `"use client"`, state, or fetch
- [ ] **No `contact_messages` table** — verified against the live project (16 tables; none for contact) and in no migration
- [ ] **No `POST /api/contact` route** — `app/api/` has admin, availability, bookings, email, notifications, queue, session, stripe, super-admin, twilio, webhooks; nothing receives an enquiry
- [ ] **No email to the business and no auto-reply to the sender** — the promised *"usually within 24 hours"* is unfulfillable because nothing arrives
- [ ] **No admin inbox** — nothing lists or reads enquiries. `support_tickets` is staff-created for refunds (`/api/admin/support`), not a public inbox

### Gaps — 🟡 high
- [ ] **Silent failure is the worst kind.** The form looks real, sits in the top navigation and the footer, and the page tells elderly visitors *"we will work with you to navigate our website"* — so the highest-trust surface on the site is the least functional. Every one of the three public data forms is dead: `/contact`, `/volunteer`, `/workforce-apply`
- [ ] **No triage or urgency handling.** The topic select is never stored, so nothing is routed by topic; nothing flags an urgent or crisis-adjacent message, and an unattended inbox can receive someone in distress with no safety auto-reply pointing to `/crisis` or 988
- [ ] **No spam protection** — the moment this endpoint exists it is unauthenticated and public, so a honeypot, rate limiting, and volume visibility are required from day one, not retrofitted

### Gaps — 🟡 medium
- [ ] **No delivery or ownership tracking** — no read/replied state, no record of who answered, no internal notes
- [ ] **No `/privacy` link or consent note** beside a form collecting email, phone and a free-text message
- [ ] **Domain inconsistency** — `site.email` is `@ourearsareopen.org` while Resend sending is configured on `ourearsareopen.com`; align before building on it
- [ ] **No attachment option** — decided in the questions below
- [ ] **No auto-reply wording or sign-off** defined

### Interim workaround (no code)
- [ ] Point "Send Message" at a `mailto:` with a prefilled subject and body (details already exist in `site.email`), or an external form service, so enquiries arrive today.

### Proposed build — awaiting client confirmation, NOT started
- [ ] `contact_messages` table (full_name, email, phone, topic, message, urgency flag, status new/read/replied/archived, internal notes, assigned_to, replied_at, created_at) + RLS (admins all via `is_admin()`; **no public read policy**)
- [ ] `POST /api/contact` — zod validation, message length limits, honeypot field, IP + email rate limiting; stores the row, then notifies
- [ ] Notify the business — in-app admin notification via `createNotification` + an email to the configured inbox address via `lib/email.ts`
- [ ] Auto-reply to the sender confirming receipt and restating the response window
- [ ] **Safety auto-reply** when the message matches crisis keywords — point to `/crisis` and 988 immediately, regardless of business hours
- [ ] `/contact` becomes a client component: loading / success / error states, button disabled while sending, fields cleared on success, errors announced accessibly
- [ ] `/admin/messages` inbox — new / read / replied / archived, topic + urgency filters, search, internal notes, assignment, audit-logged
- [ ] Reply from the inbox (reuses `lib/email.ts`) with the thread kept on the row
- [ ] Daily volume + spam-rejection count visible in `/admin/dashboard` so abuse is visible
- [ ] Add a `/privacy` link and a short consent line under the form
- [ ] Align `site.email` with the sending domain and add the auto-reply sign-off

### Questions
- ❓ Should enquiries land in a **new** `/admin/messages` inbox, or share the existing `/admin/support` one? (Support is staff-created; contact is inbound — different workflows.)
- ❓ Who is responsible for replying, and is **"within 24 hours"** a promise the business can keep? If not, the page copy should say something honest like "usually within 2 business days".
- ❓ Where should enquiries be delivered — the inbox in the admin area, an email address, or both?
- ❓ Approve the safety auto-reply wording for crisis keywords?
- ❓ Attachments needed (e.g. someone sending a document), or is text-only acceptable?
- ❓ Retention: how long should enquiries be kept before deletion (applicant PII)?
- ❓ Should the phone field be kept, given phone conversations need a number on file anyway?

### How to test — Module 13
_(Not applicable until this module is built. The steps below are the acceptance checks to run once it is.)_
1. Submit the form on `/contact` → one `contact_messages` row with the correct name/email/phone/topic/message; the URL does not change and no data appears in it
2. Reload immediately → no duplicate row; submitting an empty or invalid form creates nothing and shows an inline error
3. The business receives both an in-app admin notification and an email at the configured inbox address; the sender receives the auto-reply
4. A message containing crisis wording triggers the safety auto-reply pointing to `/crisis` and 988, and is flagged urgent in the inbox
5. Open `/admin/messages` as `admin` (list appears), as `listener` (redirected), and logged out (redirected); a signed-in customer cannot read or write any message
6. Mark read, add an internal note, reply from the inbox → status moves to replied, the reply reaches the sender, and the note is visible to other admins but not to the sender
7. Repeated submissions from one source are rate limited/honeypot-rejected, and the rejection is visible in the `/admin/dashboard` volume figures
8. On a slow connection the button disables and shows progress; on a forced API error the form explains the failure and preserves what was typed
9. Keyboard-only and screen-reader pass: every field labelled, success and error messages announced, focus moves to the success message
10. Send a message containing personal/sensitive information → confirm it is stored in the private table only and is not exposed in any URL, log line, or public read path

---

## Module 14: SEO & Discoverability

**Status:** 🟡 (on-page basics solid; **every technical SEO surface is missing**)

> **Scope note:** SEO appears **nowhere** in `docs/SCOPE_OF_WORK.md` — no sitemap, robots, canonical, structured data, social cards, or performance requirements were ever asked for. The pages were built for humans, not crawlers. Documented here for agreement before any code is written. Note this is the fourth gap found in a row where prototype UI shipped without its receiving/connecting half (see **Module 12** hiring, **Module 13** contact).

Whether people who need this service can find it through Google, a shared link, or a search result.

### Measured baseline (Lighthouse, production homepage, 2026-10-06)
`SEO 91 · Accessibility 96 · Best Practices 100 · Agentic Browsing 100` — **the 91 is misleading.** `robots-txt` and `canonical` both returned `scoreDisplayMode: notApplicable` because those artefacts do not exist, so Lighthouse only scored the handful of on-page checks it could find. Treat the real discoverability posture as unmeasured, not as 91.

### Current state — what exists
- [x] Unique `title` + `description` on **49 of 57** routes, all descriptions a sane 98–149 chars (no truncation risk)
- [x] Exactly **one `<h1>`** on every public page tested (`/`, `/join-team`, `/contact`) with sane `h2` nesting
- [x] **All 18 images carry `alt`** text
- [x] Semantic landmarks (`header`/`nav`/`main`/`footer`), skip-to-content link, `lang="en"`, valid `hreflang`
- [x] Crawlable anchors, page not blocked from indexing, clean HTTPS redirect
- [x] Vercel Analytics installed (`app/layout.tsx:50`) — traffic analytics, **not** SEO

### Gaps — 🔴 blockers
- [ ] **No `/robots.txt`** (HTTP **404**) and no `app/robots.ts` — no crawler instructions at all
- [ ] **No `/sitemap.xml`** (HTTP **404**) and no `app/sitemap.ts` — ~20 public routes with no sitemap, so nothing can be submitted or prioritised
- [ ] **No `rel=canonical`** on any page, and **no `metadataBase`** — duplicate-URL signals cannot be consolidated
- [ ] **No Open Graph or Twitter card tags** — verified zero `og:`/`twitter:` tags in `<head>`. Every share on Facebook/LinkedIn/X/WhatsApp/iMessage renders as a bare URL with no title, description, or image. For a service whose whole distribution model is "someone shares this link with a friend in need", this is the most costly single omission
- [ ] **No favicon served** — `/favicon.ico` 404s. Icons exist (`public/apple-icon.png`, `public/icon.svg`, `public/icon-{light,dark}-32x32.png`) but are never wired into `metadata.icons`, so the browser tab shows a default globe

### Gaps — 🟡 high
- [ ] **No structured data (JSON-LD) anywhere** in the codebase. Missing `Organization` / `LocalBusiness` (name, address, hours, `hello@ourearsareopen.org`), and — highest value — **`JobPosting` for the six openings in Module 12**, which are textbook `JobPosting` material and could surface in Google Jobs
- [ ] **Wrong canonical host.** Production serves on the auto-assigned `ourearsareopen.vercel.app`; no `.com` reference exists in code, while the client's own Stripe webhook URL (`docs/CLIENT_ACTION_REQUIRED.md` §1) already assumes `https://www.ourearsareopen.com`. Every share and citation uses a subdomain we do not control
- [ ] **Non-descriptive link text** — the only Lighthouse SEO failure: 5 homepage anchors read **"Learn More"** (`/book-listener` ×2, `/crisis`, `/volunteer`, `/community`). Anchor text is how crawlers and screen readers learn page purpose; generic anchors across the four most important pages actively hurt
- [ ] **Private portals are publicly indexable.** `middleware.ts:18-21` gates only `/super-admin` and `/admin`; **`/team-member/queue` returns HTTP 200 to anonymous visitors**, rendering the portal shell. No data leaks (its API calls correctly reject non-listeners), but a **listener portal can appear in Google results** — poor optics for a mental-health service, and it invites bot traffic
- [ ] **No `robots.txt` disallow list** — `/api`, `/profile`, `/session`, `/payment` are all reachable by crawlers today

### Gaps — 🟡 medium
- [ ] **No `title.template`** in the root layout — every page hand-writes the `| Our Ears Are Open` suffix instead of inheriting it, so nothing is enforced centrally
- [ ] **Legacy `keywords` array** in `app/layout.tsx:16-23` — a dead field Google has ignored since 2009. Harmless today (no page repeats it) but it should be removed so it isn't mistaken for an SEO lever
- [ ] **Double `<h1>` on every portal page** — `components/dashboard/dashboard-header.tsx` renders the portal name as `<h1>` and each page adds its own, so `/team-member/queue` has "Team Member Portal" *and* "Chat Queue". Broken heading hierarchy (also an a11y issue)
- [ ] **8 routes carry no `metadata`** and inherit the root title/description: `app/page.tsx` (homepage), `app/book-session`, `app/listener`, `app/workforce`, and the three portal index pages. (`app/community/[slug]` is **not** among them — it exports `generateMetadata` and builds a correct per-slug title + description; it is still missing an OG image, as is every other route.)

### Gaps — not yet measured
- [ ] **Core Web Vitals unmeasured.** Lighthouse here excludes performance. For a service aimed at elderly users, crisis traffic, and low-end Android devices, **LCP and INP matter more than the 91**. Needs a real field measurement (Vercel Speed Insights or `web-vitals` reporting to an endpoint), not a lab score

### Proposed build — ordered by value per hour, NOT started
- [ ] **Attach the real domain** `ourearsareopen.com` → Vercel (client DNS action; everything below should land after this so canonicals and OG image URLs are built on the right host)
- [ ] `app/robots.ts` — allow all, `disallow` `/api`, `/admin`, `/super-admin`, `/team-member`, `/profile`, `/session`, `/payment`, `/chat-queue`, and point at the sitemap
- [ ] `app/sitemap.ts` — all public routes with `lastModified`, excluding authed/portal/noindex routes; submit in Google Search Console
- [ ] `metadataBase` on the root layout + `alternates.canonical` per page
- [ ] **Open Graph + Twitter card metadata** with a purpose-built 1200×630 share image (`app/opengraph-image.tsx` generated via `next/og`, brand colours from `--primary`/`--brown`), plus `metadata.icons` wiring the existing `public/apple-icon.png` / `icon.svg` so the favicon stops 404ing
- [ ] **JSON-LD**: `Organization` + `LocalBusiness` sitewide, `JobPosting[]` generated from the `job_openings` table (depends on **Module 12**), `BreadcrumbList`, `WebSite`
- [ ] `title.template: "%s | Our Ears Are Open"` in the root layout; add metadata to the 7 uncovered routes, starting with the homepage; add a per-slug OG image to `community/[slug]`
- [ ] Replace the 5 "Learn More" anchors with descriptive text (and sweep the rest of the site for the same pattern)
- [ ] Gate `/team-member/*` in `middleware.ts` alongside `/admin` + `/super-admin`, and add `robots: { index: false }` to all three portals
- [ ] Fix the double-`h1`: `dashboard-header.tsx` portal title becomes a non-heading element
- [ ] Remove the dead `keywords` array
- [ ] **Core Web Vitals instrumentation** — `web-vitals` reported to an API route + a small admin trend view, so LCP/INP/CLS are observed in the field for real users
- [ ] Google Search Console + Bing Webmaster setup, and a `sitemap` ping on deploy

### Questions
- ❓ Do we own `ourearsareopen.com`, and who controls its DNS? (Blocking — canonical host, share URLs and the Stripe webhook all depend on it)
- ❓ Is the site intended to be found via Google search, or is distribution word-of-mouth/social only? Changes how much effort items 2-3 deserve versus 4-5.
- ❓ Is a Google Business Profile wanted? A LocalBusiness listing would matter for "listening support near me" style searches and would need the verified domain.
- ❓ Which `.org` vs `.com` address is canonical for published contact details (`lib/site.ts:30` is `.org`; Resend sending is on `.com`)?
- ❓ Any target regions or languages? Currently single-locale `en` with no `hreflang`.
- ❓ Should the three portal areas be `noindex`, or fully blocked at the edge?

### How to test — Module 14
_(Not applicable until this module is built. The steps below are the acceptance checks to run once it is.)_
1. `/robots.txt` returns 200 with the intended `Allow`/`Disallow` rules and a `Sitemap:` line; `/sitemap.xml` returns 200 and lists every public route
2. Submit the sitemap in Google Search Console; confirm no disallowed routes appear as indexed
3. Paste a page URL into the Facebook/LinkedIn/X sharing debugger — title, description and image all render
4. `curl -s <page> | grep -i 'rel="canonical"'` returns an absolute URL on the real domain
5. Google Rich Results Test accepts the `Organization` and `JobPosting` markup with no errors
6. Browser tab and mobile home screen show the real icon; `/favicon.ico` no longer 404s
7. Anonymous request to `/team-member/queue` redirects to `/login`; all three portals return `noindex`
8. Every public page has exactly one `<h1>` and a unique `title`; no two pages share a description
9. Lighthouse SEO re-run scores 100 and `robots-txt` / `canonical` now report as applicable passes (not `notApplicable`)
10. Field Core Web Vitals (LCP/INP/CLS) are being collected and visible in the admin view, with p75 trending in the "good" band

---

## Module 15: Community Rooms (Group Support)

**Status:** 🟡 (real, admin-managed room *content* ships; **the rooms do not exist, and the page presents invented activity as real**)

> **Scope note:** `docs/SCOPE_OF_WORK.md` scopes community rooms **as content only** — `:145` "Content: community rooms (edit titles, descriptions, order)", `:162` "Community rooms content API and admin editing", `:202` Module 11 "Community rooms copy". **Group chat / group messaging was never scoped at any point**; the only messaging in scope is 1:1 session chat (`:177`, Module 6) and the queue (Module 5). That content half is **delivered**. The invented member counts, invented testimonials and "create your own community" copy are prototype leftovers from a design that assumed group chat would exist. Splitting the module in two: **15A** is a trust problem to fix now; **15B** is a feature that needs a decision before it is costed.

### How it works today
1. Admin manages room titles/descriptions/order at `/admin/content` → `content_rooms` (migration `0016`, public read + `is_admin()` write, via `GET/POST/PATCH/DELETE /api/admin/content/rooms`). **8 active rooms** in the live project, all with real copy.
2. `/community` lists the active rooms, plus a one-on-one support widget whose `listenersAvailable` figure is **real** (`profiles.open_queue_enabled` via `getListenersAvailableCount()`), pointing at the working `/book-listener` and `/chat-queue`.
3. "Enter Room" → `/community/[slug]`, which shows the real title/description, `notFound()`s on an unknown or inactive slug, and exports `generateMetadata` for per-slug SEO title/description.
4. The room page then states **"Community rooms are coming soon"** and offers the 1:1 alternatives. There is no group chat.

### Gaps — 🔴 trust (fix regardless of any build decision)
- [ ] **Invented member counts presented as fact.** `DEFAULT_ROOM_META` is a hardcoded map in **two** files (`app/community/page.tsx:50-59`, `app/community/[slug]/page.tsx:37-61`) giving all 8 rooms member counts and "online" counts. They sum to **847 members** and **82 online**, and the hero renders that total as **"82 people active right now"** behind an animated live-pulse dot. Verified in the production HTML on 2026-10-06 (`\"82\",\" people active right now`). A visitor — including one in distress deciding whether this space is populated — is shown a fabricated headcount
- [ ] **Invented member testimonials.** The "Wins Being Shared Right Now" feed (`app/community/page.tsx:61-92`) is a hardcoded array of five first-person posts about mental-health wins, with fabricated relative timestamps ("2 min ago", "5 min ago" …). Verified verbatim in production: *"Finally said no to overtime this week. Small win but it felt huge!"*, *"Got the job I've been hoping for — had to share with people who get it!"*, *"Day 30 of my morning routine…"*. **Publishing invented member quotes as real activity on a mental-health service is the most damaging defect in this module** — it undermines the credibility of every genuine member post later, and a visitor who recognises the fiction may distrust the service entirely
- [ ] **Two divergent copies of the same fabricated data.** Any edit to one `DEFAULT_ROOM_META` desynchronises the directory and the room page

### Gaps — 🔴 15B: group chat does not exist
- [ ] No room-scoped messaging — `messages` is bound to `session_id`, so there is no table a room conversation could live in
- [ ] No membership: no join, no leave, no member list, no roles, no capacity, no private/invite rooms
- [ ] No presence — "online" cannot be real until members exist, which is why it was faked
- [ ] No room history persistence, search, unread counts, or reply/mention notifications (the notification center exists — `createNotification` — and is simply not wired to rooms)

### Gaps — 🟡 safety promises with no mechanism behind them
- [ ] The page advertises a **"safe, moderated space (18+)"** and publishes "Keep it Safe" guidelines, but there is **no moderation of any kind**: no report/flag, no block or mute, no rate limiting, no profanity or self-harm filter, no moderator queue, no audit trail. Nothing sits between a member and a room
- [ ] **No age verification.** "18+ only — legal minimum age" is asserted in the hero and guidelines, but nothing captures or checks a date of birth at registration or at join (same gap as the contact form in **Module 13**). The site states this as a *legal minimum*, which makes it a compliance question, not just a UX one
- [ ] **No crisis path inside a room.** `/crisis` exists and is one click away sitewide, but a group room has no safety-netting notice, no self-harm keyword detection with an automatic pointer to 988, and no "report this person" escape hatch. Group chat multiplies this risk well beyond the 1:1 session room, which at least has a listener present and an end-reason safety review trail
- [ ] **"Create your own community" is advertised but unsupported.** The hero promises it twice ("create your own community", "Join Community"); only admins can create rooms, and a member who tries has no path at all

### Gaps — 🟡 medium
- [ ] No analytics on `/community` — no way to know whether the section is used before investing in it
- [ ] Rooms are all public and always-open; no scheduled sessions, no host-present hours, no listener-moderated rooms
- [ ] No policy for message retention, deletion on request, or what happens when a member asks for their posts to be removed — a real obligation once other people's words are published

### Immediate recommendation (15A — no dependencies, no client decision needed)
- [ ] Take the fabricated numbers and invented testimonials down now. Either remove them, or — if the design intent was to show what the space will look like — label them unambiguously as examples ("Example of what members share") rather than as activity
- [ ] Replace "82 people active right now" with the honest, already-real signal: the live listener count and current wait estimate
- [ ] Keep the room directory (it is real and useful as an index of topics we can support) and keep the 1:1 CTAs, which work end-to-end
- [ ] Collapse the duplicated `DEFAULT_ROOM_META` into one module, or delete it

### Proposed build — 15B, NOT started and NOT costed pending the questions below
- [ ] `community_room_members` (room_id, user_id, role member/moderator, status active/muted/left/banned, joined_at, last_seen_at) + RLS
- [ ] `community_messages` (room_id, sender_id, body, created_at, edited_at, deleted_at, flagged_at, hidden_at) + RLS (members read, members insert own, moderators/admins manage)
- [ ] Realtime per room, reusing the proven `sessions`/`messages` pattern (`postgres_changes` + presence), so "online" becomes a real number
- [ ] `/community/[slug]` becomes the real room: message list, composer, join/leave, member list, unread badge, history
- [ ] **Moderation as a first-class feature**: `community_reports` queue at `/admin`, per-message remove, mute/ban, slow mode, and a keyword filter whose matches trigger a safety-netting reply pointing to `/crisis` and 988
- [ ] Age gate at join (self-declared date of birth) to back the 18+ claim
- [ ] Room creation: admin-only with a "request a room" form for members, or member-created with moderation — decide first
- [ ] Wire replies/mentions into the existing notification center
- [ ] Room-level reports + an admin moderation dashboard with an audit trail

### Questions
- ❓ **Is group chat actually wanted for launch, or is 1:1 (booking + queue) sufficient?** This is the whole module: it is the difference between a week and a month of work, and moderation is an *ongoing operational commitment*, not a build.
- ❓ **Who moderates, and how many hours a day?** If nobody is rostered, the honest recommendation is not to open group chat and to leave the rooms as a directory of topics.
- ❓ Account-only, or allow anonymous posting? Account-only is far easier to moderate and to remove.
- ❓ Self-declared date of birth at join, or an 18+ checkbox? Given "legal minimum age" is stated publicly, confirm what is actually required for an LLC in Florida.
- ❓ Public rooms only, or private/invite rooms?
- ❓ Should a trained listener moderate or host rooms, or is this peer-only support?
- ❓ Message retention and deletion-on-request policy, before any member words are published?
- ❓ Should the invented testimonials be replaced with **real** member quotes (with consent) once the space is genuinely used — which would also make the section honest and persuasive?

### How to test — Module 15
_(15A can be verified now; the 15B steps apply once built.)_
1. `/community` and every `/community/<slug>` show no fabricated member count, online count, or member quote; any illustrative content is visibly labelled as such
2. The live "people active" figure is derived from real data (listener availability) and changes when a listener toggles availability
3. `curl -s https://<domain>/community` contains no hardcoded testimonial strings
4. An unknown or deactivated slug returns 404; an active one renders its real title/description
5. As a member: join a room, post, and see the message appear live in a second browser without refresh; "online" reflects real presence
6. As a non-member: cannot read history or post; as a `customer` cannot access any moderation control
7. Post a message containing self-harm keywords → safety-netting reply with `/crisis` + 988 appears automatically and the message is flagged for review
8. Report a message → it appears in `/admin` moderation queue; removing it, muting or banning the author takes effect immediately
9. Age gate blocks an under-18 declared date of birth from joining, and the attempt is logged
10. Deleting a member's account removes or anonymises their messages per the agreed retention policy

---

## Module 16: Flow Verification Findings (full system review, 7 October 2026)

**Status:** 🔴 3 blockers found · 🟡 8 further gaps · test data removed after review

Every user-facing flow was walked end to end in a real browser against production, with three test accounts (customer, listener, super admin) and a fourth temporary account to test sign-up. Findings are grouped by severity. This module exists because several items below were previously marked complete in this tracker and were **not** — those claims have been corrected in place (Modules 3, 6, 8, 9).

### Verified working (no action)
- All 53 application routes return successfully; no server errors
- Sign-up validation is thorough: at least one service, terms agreement, 18+ confirmation and contact consent are all enforced
- **Queue flow end to end**: pay to join -> entry created -> auto-assigned to the waiting listener -> live chat delivered in real time between two browsers -> notes saved -> session completed -> notes document created -> customer notified
- Listener: toggle availability, weekly availability save/load, queue pool, accept
- Admin/super-admin: every page loads; role change, deactivate/reactivate, feature flags, content room create + delete, notifications mark-read all work
- Profile booking flow (book, pay/free, accept, join window, complete) verified previously
- Notifications inbox renders real entries with timestamps
- Payment guards: free bookings and already-paid bookings are refused

### 🔴 Blocker 1: every new registration loses everything the user typed
**Symptom.** A person signs up, enters first name, last name, email, age range, pronouns, reason for being there, selects services, ticks the terms agreement, confirms 18+ and consents to contact. When the account is created, **all of it is discarded**. The profile row exists with only an email address; `full_name`, `age_range`, `pronouns`, `reason` are null and `services_consent` is `false`.

**Proof.** Tested with a new registration on production, and confirmed against the client's own existing account `kelvinramsiel01@gmail.com`, which has `full_name: null`, `age_range: null`, `reason: null`, `services_consent: false` despite being created through the real form. (Accounts created through the admin API are unaffected, which is why the super-admin account does show a name.)

**Cause.** `components/auth/register-form.tsx:117` calls `supabase.from("profiles").upsert(...)` **before** checking whether a session exists, and never checks the upsert's error. When email confirmation is required (it is: `email_confirmed_at` is null on the new account) `signUp` returns a user but **no session**, so the upsert runs as an anonymous request, is rejected by the `profiles` RLS update policy, and fails silently.

**Second, compounding bug.** `needsEmailConfirmation` at `:133` tests `data.user.identities?.length === 0`, which did not evaluate true in testing, so the "Check your email" panel never appeared. Instead the form announced "Account created!" and pushed to `/profile/setup`, which bounced the unverified, signed-out visitor to `/login?next=/profile/setup` with no explanation of why they cannot sign in.

**Impact.** Sign-up is the entry point for every customer. Until this is fixed, no customer record has a name, the "match with the right listener" step has nothing to work from, admin user lists show blanks, and **we cannot evidence that anyone consented to be contacted or to the terms**.

**Fix.** Persist the submitted profile fields on the server (an API route using the service role, keyed on the returned user id) rather than from the browser; surface and check the upsert error; correct the verification-branch condition; and make the "check your email" state reliable.

### 🔴 Blocker 2: an admin cannot add a listener
`POST /api/admin/listeners` returns **500 "Listener account created, but profile save failed."** The route creates the auth user, then `.insert()`s a profile row — but the `on_auth_user_created` trigger (`0001_auth_users.sql:42`) already created that row, so the insert collides on the primary key. Verified against production, and reproduced directly.

**Net effect:** the account is created but has role `customer`, and the admin sees a server error. No listener has ever been created through the interface. This blocks Module 12 (hiring) end to end and contradicts the client's requirement to "approve, manage and add profiles".

**Fix.** Upsert instead of insert and set `role`, `full_name`, `is_active`; better still, send a real Supabase invite so the new listener sets their own password (see Module 12).

### 🔴 Blocker 3: `availability_slots` is never populated, so follow-up booking and rescheduling cannot work
**Symptom.** A listener sets weekly availability (e.g. Tuesday 09:00 to 12:00). Inside a live session, "Schedule follow-up" reports "You have no open times available. Add availability in the Availability page first." The same is true of booking reschedule: the options list is always empty.

**Cause.** The portal stores a *weekly recurring* pattern in `profiles.availability` (JSON). But the booking code reads *concrete bookable windows* from the `availability_slots` table. **No code anywhere inserts into `availability_slots`** — every call site is a `select`, an `update` (claim/release) or a `delete`. The table has 0 rows and can never gain any. The missing piece is a step that materialises the next N days of bookable windows from each listener's weekly pattern.

**Impact.** Two features that this tracker previously marked complete cannot be used by anyone:
- in-session follow-up booking (Module 6)
- booking reschedule (Module 3, Module 8)

**Fix.** A scheduled or on-demand materialisation job that expands `profiles.availability` into `availability_slots` for the next 14 days, skipping existing bookings; plus a backfill for existing listeners.

### 🟡 Further gaps found
- **Team-member profile page shows fabricated data.** `app/(team-member)/team-member/profile/page.tsx:14-21` is commented `// Mock data` and renders a fictional listener, "Sarah Johnson", with 8.5 hours this week, 12 calls and 18 chats. Every listener who opens their own profile sees someone else's invented record. The team-member *dashboard* is real, so the portal contradicts itself.
- **Profile "Settings" tab does nothing.** Three rows in `components/profile/profile-view.tsx:674-730` are `<button>` elements with no handler: Notifications ("Email and SMS preferences"), Security ("Password and sign-in") and Payment Methods ("coming soon"). There is no notification-preference storage anywhere in the schema, and no in-app password change for a signed-in user (only the emailed `/reset-password` route). A customer cannot change their password or their contact preferences.
- **Team-member Settings page is also inert** — "Configure" (notifications) and "Update Password" buttons at `app/(team-member)/team-member/settings/page.tsx:32,48` do nothing.
- **Google and Apple sign-in buttons do nothing** — `app/login/page.tsx:90,93` are `type="button"` with no handler, presented under "OR CONTINUE WITH".
- **Four team-member pages render for signed-out visitors** — `queue`, `availability`, `settings`, `profile` have no auth check and `middleware.ts` gates only `/admin` and `/super-admin`. No data leaks (their API calls correctly reject non-listeners) but the shells are public and indexable.
- **Sign-up asks for consent to documents that do not exist.** The registration form requires ticking "I agree to the Privacy Policy and Terms of Service" with links to `/privacy` and `/terms`, both of which 404. The same links appear in the footer, on the payment page and on the sign-up page: 6 references to 3 missing pages.
- **The service preference a customer chooses at sign-up is discarded.** "chat / phone / both" is written only to auth metadata; there is no `services` column on `profiles` and nothing reads it back, so the answer is never stored or used for matching.
- **Age confirmation is collected but not stored.** The 18+ checkbox exists at sign-up, but no date of birth or age field exists on `profiles`, so the confirmation cannot be evidenced later (this also underpins the "legal minimum age" claim discussed in Module 15).
- **A disabled link swallows its own click** — `components/community/chat-queue-widget.tsx:122`: "Connect Now" is a `<Link>` wrapping a `disabled` button, so when no listener is available the link cannot be clicked and no explanation is shown.

### Notes on scope
- The Stripe card field cannot be automated in this environment, so a full card payment was not driven end to end. Everything downstream of payment was verified by seeding a succeeded payment record and exercising the real endpoints.
- Two abandoned `payments` rows belonging to the super-admin account (`requires_payment_method`, from 4 September and 6 October) pre-date this review and were left untouched.
- All five test accounts created for this review, and every booking, session, message, document, notification, queue entry, payment and availability row created with them, were deleted afterwards. The database is back to its previous state plus the two admin accounts the client asked for.

### How to test — Module 16
1. Register a brand-new account through the public form with every field completed -> profile row shows the submitted name, age range, pronouns, reason and consent; a "check your email" state is shown and the visitor is not dumped on the login page
2. As an admin, add a listener -> 201, the profile has role `listener`, and the new account receives a set-your-password email
3. As a listener, set weekly availability -> within one cycle, bookable windows appear and `availability_slots` has rows for that listener
4. In a live session, "Schedule follow-up" lists real open times and a follow-up booking can be created (free and paid)
5. As a customer, reschedule a booking -> real alternative times are offered and the booking moves
6. Open `/team-member/profile` as a listener -> shows that listener's real name and hours, never "Sarah Johnson"
7. Open the profile Settings tab -> notifications, security and payment rows open real screens, and a password can be changed
8. Sign out, then request `/team-member/queue` -> redirected to login
9. Sign-up consent links open real Privacy and Terms pages
10. Register with chat selected, then inspect the profile -> the service preference is stored and used for matching

---

## UI & UX Recommendations (consolidated, reviewed 7 October 2026)

Collected from the flow review and the accessibility and search passes. Grouped by theme, roughly in the order they matter. Nothing here is a blocker; these improve trust, clarity and usability.

### 1. Truthfulness and trust (do first)
- **Remove or clearly label invented figures.** The hardcoded "5,000+ people helped", "50+ trained listeners", "82 people active right now", the 847 member counts and the five invented "Wins" testimonials. Either delete them or label them explicitly as examples. See **Module 15** and the home page note in **Module 16**
- **Audit every marketing claim against something measurable.** "Join thousands who have found support" also appears on `/register`. Where a figure is genuinely true of the organisation, say what is being counted; where it is not, replace it with a real count from the database
- **Show real state instead of reassurance.** Where a feature is not live, say so plainly and offer the working alternative. The current pattern ("Coming soon" panels, disabled buttons with no explanation) reads as brokenness

### 2. Feedback and error handling
- **Every submit needs three states**: working, success, failure. The three dead forms fail silently; the donation form shows a generic error for what is really a sign-in requirement
- **Explain failures in plain words.** "Unauthorized" from the donation payment should read as "Please sign in to donate, it takes about twenty seconds"
- **Never discard what someone typed.** Losing a long concern description or a written introduction because of a failure is the worst possible outcome on a form like these
- **Add a loading state to every button** that triggers work. Several admin and portal actions give no indication anything is happening

### 3. Navigation and wayfinding
- **Collapse the main menu earlier.** At roughly 1024 to 1280 pixels the seven links, Crisis Help, Log In and Sign Up all render and the labels wrap to two lines. Collapsing at about 1100 pixels fixes tablets and small laptops
- **Shorten two or three labels.** "Book a Listener", "Chat Queue" and "Join Our Team" are the longest
- **Give the footer legal links real pages**, and stop asking people to agree to them at sign-up while they 404
- **Add a visible "you are signed in as X" state** with role, so a listener or admin never wonders which account they are in. The portals currently show only "Team Member Portal" or "Administration"

### 4. Dead controls must not look alive
Seven dead controls were found. A button that looks clickable and does nothing is worse than no button:
- profile Settings rows (notifications, security, payment methods), team-member Settings rows, and the Google and Apple sign-in buttons should either work or be visibly unavailable with a reason
- Where a feature is planned, say what is planned and when, rather than showing an inert control

### 5. Forms and input
- **Label every control properly.** The intro-video group on the volunteer and application forms has no associated labels, and a file input cannot be labelled by placeholder alone, so screen readers announce nothing
- **Enforce what the label promises.** The resume field says "required" on both application forms but does not enforce it
- **Collect what the process needs.** Phone number is needed for phone conversations but is not collected at application; date of birth is needed to evidence the 18+ claim but is not collected
- **Warn before losing work** on long forms if someone tries to leave
- **Show progress** on multi-step forms such as the five-step booking flow, which currently gives no sense of how much is left

### 6. Accessibility
- **Fix colour contrast.** Lighthouse flags the pill badges and inline links on the home page. The warm brown palette needs its lighter text shades darkened for text use
- **Fix the double heading.** Portal pages render two `h1` elements, one from the layout header and one from the page. The layout title should not be a heading
- **Invalid markup in buttons.** Several places wrap a `<Button>` inside a `<Link>` without `asChild`, producing a button nested inside an anchor. Use one or the other
- **Announce dynamic changes.** Success and error messages need to be announced to screen readers, not only shown
- **Respect reduced motion.** Several decorative animations (the pulsing "active now" dot, `animate-ping`) should stop for visitors who ask for reduced motion

### 7. Content and tone
- **Say what happens next, everywhere.** After booking, after applying, after sending a message: what you will do, when you will do it, and what they should do if it does not arrive
- **Replace jargon.** "1099", "legal minimum age" and "debrief time" appear to customers and volunteers with no explanation
- **Be consistent about the promise.** The Contact page promises a reply within 24 hours, which nothing currently enforces or measures
- **Correct the domain references.** The footer advertises `hello@ourearsareopen.org` while sending is configured on `.com`, and the Stripe instructions assume `ourearsareopen.com`

### 8. Search and sharing
Covered in detail in **Module 14**. The short version: connect the real domain, add a sitemap and robots file, add social sharing cards with the logo, and give the five "Learn More" links real descriptions.

### 9. What is genuinely working well and should be protected
Worth naming, because these are the parts that are hard to build and easy to break:
- The booking flow is now clear end to end, with sensible validation and a fair free option
- The session room is calm and uncluttered, with a visible timer, a clear way to end, and safety reasons recorded
- The listener's tools (notes, follow-up, complete) sit together and are easy to find
- Crisis resources are reachable from every page, and the crisis button is persistent
- The skip-to-content link, landmarks and heading structure are sound on public pages

---

## Cross-Module Decisions & Architecture Notes

This section captures decisions that span multiple modules. Revisit as you build.

- [ ] Confirm realtime approach: Supabase Realtime for chat/queue; Twilio or LiveKit for voice
- [ ] Confirm file storage: Supabase Storage buckets (`avatars`, `documents`; `applications` planned in **Module 12**)
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
- **Paid in-session follow-up → payment-link email** (route wired; the paid email only actually sends once Resend has a verified domain) — needs **Resend** — ⬜
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
