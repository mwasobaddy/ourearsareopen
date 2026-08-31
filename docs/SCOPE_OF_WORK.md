# Our Ears Are Open — Scope of Work & Technical Specification

**Document Version:** 1.3  
**Last Updated:** March 2026  
**Requirements Source:** Client requirements document; **Scope of Work PDF** (v2.0, March 11, 2026 — *ScopeOfWork_OurEarsAreOpen.pdf*)  
**Tech Stack:** Backend — BunJS | Frontend — Next.js (App Router) | Database — MongoDB

---

## 1. Executive Summary

This document defines the **complete scope of work**, **sequence-wise modules**, **interfaces (user roles)**, **functionalities**, **APIs**, and **data flows** for the Our Ears Are Open platform. The product is a listening-support service where:

- **Customers** book and manage phone/chat sessions with listeners, make donations, and use an open chat queue.
- **Listeners** (support staff) handle incoming sessions, queue management, and availability.
- **Admins** manage listeners, content, and operations.
- **Super Admin** owns platform-wide configuration, billing, and security.
- **Guests** see the public website and can convert to registered users.

All modules are linked; authentication, payments (Stripe), and realtime (calling/chat) are designed for production use.

---

## 2. User Interfaces (Personas) & Access Matrix

| Interface | Who | Purpose | Key Entry Routes |
|-----------|-----|---------|------------------|
| **Guest** | Unauthenticated visitors | Browse site, crisis resources, donate (one-off), see book/listener/community; must register to book or join queue | `/`, `/about`, `/community`, `/donate`, `/crisis`, `/contact`, `/book-listener`, `/login`, `/register` |
| **Customer** | Registered users (callers) | Profile, booking management, session history, start/join calls and chats, payment methods, donations | `/profile`, `/profile/setup`, `/book-listener`, `/payment`, `/chat-queue`, post-login redirects |
| **Listener** | Support staff (team members) | Dashboard, availability, hours/calls/chats stats, conduct phone/chat via website only, queue, session notes, debrief | `/team-member` or `/workforce` or `/listener` — **new** (team-member/workforce per requirements) |
| **Admin** | Operations / content managers | Listener management, session oversight, content (e.g. community rooms), reports, support tools | `/admin` — **new** |
| **Super Admin** | Platform owner | Global config, tenant/org settings, Stripe/billing, audit logs, feature flags, user/listener roles | `/super-admin` — **new** |

**Linkage:** Guest → Customer (register/login). Customer ↔ Listener (sessions). Admin manages Listeners and content. Super Admin manages Admins and platform.

**Terminology (requirements doc ↔ scope):**  
- **Team member** = Listener (support staff who take calls/chats).  
- **Consumer** = Customer (person who books or joins queue).  
- **Administrative staff** = Admin.  
- **Workforce website** = Team member / Listener portal (`/team-member` or `/workforce`).

**Business rules (from requirements):**  
- **No off-website communication:** Team members must not chat or call outside the website; doing so is grounds for termination. All sessions (phone and chat) occur only via the platform.  
- **Phone by appointment only:** No phone queue; phone sessions are only scheduled appointments. Only chat has an open queue.  
- **No consumer call-in hotline:** Consumers cannot call in; they book appointments and only the team member initiates the phone call via the website dialer.  
- **Chat queue:** Minimum $1 donation to join; chat only (no phone queue).  
- **Session length:** Default session length (e.g. 15 min); system warns around 14 minutes so the team member can end appropriately; team member can extend by 5–10 minutes if needed.  
- **No auto pop-up next session:** After a call or chat, the next session must not auto-pop; team member must have debrief time before accepting the next.  
- **Team member hours (1099):** For initial phases, team members are 1099; max 15 hours per week; system must track and enforce/monitor hours.  
- **Pay:** Team members get paid weekly on Friday; payroll tracking/integration to be assisted (likely external system).  
- **No payment option for team members:** Team members must never see or access any payment UI or process payments. All payments are consumer-facing only (consumer pays via platform or via emailed payment link).

---

## 2.5 New Features vs Current Codebase

**Current codebase (existing):** Next.js front-end only. Public pages (Home, About, Community, Donate, Crisis, Contact, Join Team, Volunteer), Book Listener (multi-step form UI), Payment (order summary + card form UI), Chat Queue (donation form UI), Login/Register (forms only), Profile (tabs: Conversations, Documents, Info, Settings), Profile Setup (multi-step UI). Auth is a stub (`useAuth()` returns `isAuthenticated: false`). No API routes, no database, no real payments, no realtime.

**New features** below are everything that must be built on top of the existing UI to make the product functional. Use this list to cross-check against any external requirements document.

### New — Auth & identity

- Real user registration (email + password, validation, terms)
- Real login / logout with session or JWT
- Session persistence and protected routes
- Password reset (forgot / reset with token)
- Email verification (optional)
- Role-based access (customer, listener, admin, super_admin) and role assignment by admin/super-admin

### New — Profile & onboarding

- Profile CRUD backed by API and database
- Profile setup completion state and redirect logic
- Avatar upload and storage
- Assigned listener (link customer to a listener for booking suggestions)

### New — Booking (scheduled sessions)

- Listener preference options from API/config
- Availability slots from backend (by date and type)
- Create booking (submit to API, persist in DB)
- Booking hold (optional time-limited hold while user pays)
- List upcoming and past bookings for user
- Cancel and reschedule booking with policy

### New — Payments (Stripe)

- Create Stripe PaymentIntent for booking
- Confirm booking on successful payment (webhook)
- One-off donation (donate page) with Stripe
- Chat-queue minimum payment to join queue
- Saved payment methods (list, add, remove)
- Stripe webhooks (payment_intent.succeeded, failed, etc.) with idempotency
- Admin-initiated refunds and dispute logging

### New — Open chat queue

- Join queue after minimum payment
- Realtime or polling queue position and estimated wait
- Assign next customer to available listener
- Leave queue (and optional refund policy)
- Listener “available for queue” toggle and “listeners available now” stats for widget

### New — Realtime voice & chat

- Session room/token creation (e.g. Twilio/LiveKit for voice)
- Voice calls (start/end, duration, disconnect handling)
- Real-time text chat (WebSocket or managed service) with optional history
- Session state (started, ended) and in-session notifications (e.g. “Listener joined”)

### New — Listener dashboard & availability (team member portal)

- Dedicated route: `/team-member` or `/workforce` (accessible only to team members and admin)
- Listener login: username created by admin + password set on first sign-in (admin-created accounts)
- Listener-only login and redirect to team member profile/dashboard
- Team member profile page: hours worked, number of calls and chats for week and month; 15 hr/week cap (1099)
- Set availability (schedule) for scheduled bookings
- Queue availability toggle; if no appointments, join chat queue
- View consumer profile and signup answers before session
- Start session (voice/chat) only via website; phone: only team member dials via website dialer for appointments
- Disconnect call/chat if threatened or inappropriate (safety disconnect with reason)
- 14-minute warning before auto-end; team member can end appropriately or add time (5–10 min extension)
- No auto pop-up next session; debrief time required; then notes on consumer profile for future team members
- **In-session follow-up booking:** When a session reaches its time limit, team member can schedule a follow-up appointment directly within the active call or chat. Script guides free vs paid; if paid, automated email to consumer with payment link only (team members never see or process payment).
- Private/shared session notes (visible to other team members for same consumer)

### New — Session & call management

- Session model (scheduled + queue-origin) with full lifecycle; default length (e.g. 15 min)
- 14-minute warning then auto-end flow; team member can add time (5–10 min) or end appropriately
- Session history for customer (past sessions, listener, type, documents)
- Session documents (e.g. notes PDF) and download
- Post-session email to consumer: synopsis of conversation + encouraging words (automatic)
- No-show handling (mark no-show, free slot)
- Email/SMS reminders (e.g. 24h, 15 min before session)

### New — Admin interface

- Full control of website (admin only)
- Admin dashboard (stats: active listeners, sessions, queue, donations)
- Listener (team member) management: add in backend, remove/deactivate; hiring/firing workflow
- Monitor team member hours (weekly/monthly, 15 hr cap); hours dashboard
- Monitor chat and phone sessions (session list, duration, status; optional audit/logging)
- User list (consumers): search, view profile, delete and reinstate profiles
- Content: community rooms (edit titles, descriptions, order)
- Reports (sessions, revenue, listener utilization, queue stats)
- Refunds and support (initiate refund, internal notes)
- Email: verify on consumer signup; post-session synopsis to consumer; receipt on any payment

### New — Super Admin

- Super admin dashboard (platform health, revenue, counts, alerts)
- Organisation/tenant config (name, logo, support email, crisis links, timezone)
- Feature flags (open queue, donations, free booking, etc.)
- Stripe/billing config (products, prices, webhook URL metadata)
- Role assignment (promote/demote admin, listener)
- Audit log (sensitive actions)
- System notifications (email/SMS provider and templates)

### New — Content & marketing (backend/CMS)

- Community rooms content API and admin editing
- Crisis page content API and admin editing
- **Email system:** (1) On free signup: automatic verification email with button redirect back to website; (2) After every chat/phone session: automatic email to consumer with synopsis and encouraging words; (3) When team member books a *paid* follow-up in-session: email to consumer with payment link only (team members never handle payment); (4) Receipt on any payment; (5) Ability to send emails to team members and consumers (ongoing)
- Email templates (booking confirm, reminder, password reset, receipt) and sending
- In-app notification center (optional) for session reminders and system messages

### New — Infrastructure & backend

- BunJS API server (or equivalent) with all APIs listed in this doc
- MongoDB collections (users, listeners, bookings, sessions, payments, queue_entries, documents, content_rooms, content_crisis, audit_log, feature_flags, org_config)
- WebSocket or managed realtime for queue and in-session chat
- Stripe integration (products, Payment Intents, webhooks, idempotency)

### New — Routes (pages)

- `/session/[id]` — In-session page (voice/chat room) for customer and listener
- `/team-member` or `/workforce` (or `/listener`) — Team member portal; only team members and admin (per requirements)
- `/admin` and children — Admin layout and all admin pages
- `/super-admin` and children — Super Admin layout and all super-admin pages

When you have a separate requirements document (e.g. from stakeholder or client), map each requirement to the phase and functionality number above (e.g. “Requirement R1 → Phase 4, 4.1–4.2”) in the **Requirements Cross-Reference** section below.

---

## 3. Sequence-Wise Modules (Implementation Order)

Modules are ordered by dependency: foundation first, then core product, then operations and super-admin.

| Phase | Module | Description | Interfaces Using It |
|-------|--------|-------------|---------------------|
| **1** | **Auth & Users** | Registration, login (email/password + optional OAuth), sessions, roles, profile CRUD | Guest → Customer; all roles |
| **2** | **User Profile & Onboarding** | Profile completion (profile/setup), personal info, preferences, assigned listener (optional) | Customer |
| **3** | **Booking (Scheduled Sessions)** | Book listener flow: type (phone/chat), preferences, date/time, availability, create booking | Customer, Listener, Admin |
| **4** | **Payments (Stripe)** | One-time (booking, donation, chat-queue min) and saved payment methods; webhooks; idempotency | Customer, Admin, Super Admin |
| **5** | **Open Chat Queue** | Join queue, min donation, match “next available” listener, realtime queue position | Customer, Listener |
| **6** | **Realtime: Voice & Chat** | WebRTC/voice for phone sessions; WebSocket/real-time chat; session start/end, duration | Customer, Listener |
| **7** | **Listener Dashboard & Availability** | Listener login, set availability, accept/decline sessions, view queue, start session | Listener |
| **8** | **Session & Call Management** | Session lifecycle (scheduled + ad-hoc), notes, history, documents (e.g. PDFs), no-shows | Customer, Listener, Admin |
| **9** | **Admin Interface** | Listener CRUD, session list, reports, content (community rooms), support actions | Admin |
| **10** | **Super Admin** | Org config, feature flags, billing/Stripe config, audit logs, role assignment | Super Admin |
| **11** | **Content & Marketing** | Community rooms copy, crisis content, emails (booking confirm, reminders), notifications | Guest, Customer, Listener |

---

## 4. Functionalities to Add (Sequence-Wise)

### Phase 1 — Auth & Users

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 1.1 | User registration | Email + password (and optional OAuth); validation; terms acceptance | Guest → Customer | `POST /api/auth/register` |
| 1.2 | Login / logout | Session-based or JWT; secure cookie; remember me optional | All | `POST /api/auth/login`, `POST /api/auth/logout` |
| 1.3 | Session persistence | Middleware to protect routes; role-based redirect (customer/listener/admin/super-admin) | All | Session store (e.g. Redis or DB); middleware |
| 1.4 | Password reset | Forgot password flow; email link; reset token expiry | Guest, Customer | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| 1.5 | Email verification | Verify email after signup; automatic email with button redirect back to website (required for consumers) | Customer | `POST /api/auth/verify-email`, `GET /api/auth/verify-email?token=` |
| 1.6 | Role assignment | Assign role: customer, listener, admin, super_admin (stored in User) | Admin, Super Admin | `PATCH /api/users/:id/role` (admin/super-admin only) |
| 1.7 | Team member (listener) accounts | Admin creates team member with username; team member sets password on first sign-in to workforce portal | Admin, Listener | `POST /api/admin/listeners` (invite/create with username); first-login set-password flow; `GET /api/auth/me` returns role for redirect to `/team-member` or `/workforce` |

**Interfaces:** Login/Register pages (existing UI); team member login at `/team-member` or `/workforce` with admin-created username; profile and dashboard routes use session.

---

### Phase 2 — User Profile & Onboarding

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 2.1 | Profile CRUD | Full name, email, phone, age range, pronouns, preferences | Customer | `GET/PATCH /api/users/me`, `GET/PATCH /api/users/me/profile` |
| 2.2 | Profile setup (post-signup) | Multi-step completion; redirect from `/register` or first login | Customer | Same as 2.1; `GET /api/users/me/setup-status` |
| 2.3 | Avatar upload | Profile picture; resize and store (e.g. S3 or DB blob) | Customer | `POST /api/users/me/avatar` |
| 2.4 | Assigned listener (optional) | Link customer to preferred/listener; used in booking suggestions | Customer, Admin | `GET/PATCH /api/users/me/assigned-listener` (or in profile) |

**Interfaces:** `/profile`, `/profile/setup` (existing); Settings tab in profile.

---

### Phase 3 — Booking (Scheduled Sessions)

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 3.1 | Listener preferences & slots | Fetch listener preferences (gender, belief, language, etc.); used in booking form | Customer | `GET /api/booking/preferences` (static or from config) |
| 3.2 | Availability slots | List available date/time slots for chosen type (phone/chat) and optional listener | Customer | `GET /api/booking/availability?date=&type=` |
| 3.3 | Create booking | Submit booking: type, preferences, concern text, slot, user id; create pending booking | Customer | `POST /api/bookings` |
| 3.4 | Booking confirmation (hold) | Optional: hold slot for N minutes while user goes to payment | Customer | `POST /api/bookings/:id/hold`, expiry job |
| 3.5 | List bookings (user) | Upcoming and past sessions for current user | Customer | `GET /api/bookings?status=upcoming|past` |
| 3.6 | Cancel / reschedule | Cancel or request reschedule (policy: e.g. 24h notice) | Customer | `PATCH /api/bookings/:id` (cancel/reschedule) |
| 3.7 | In-session follow-up booking | Team member schedules follow-up during active call/chat when session reaches time limit; script guides free vs paid; if paid, system sends email to consumer with payment link only (team member never sees payment UI) | Listener | `POST /api/bookings` (from session context; sessionId, consumerId, slot, isPaid); if isPaid → create payment link and send email; no payment flow exposed to team member |

**Interfaces:** `/book-listener` (existing), `/profile` (Conversations tab). Listener: in-session UI for “Schedule follow-up” (script + free/paid choice). Admin: same APIs with filters.

---

### Phase 4 — Payments (Stripe)

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 4.1 | Create PaymentIntent (booking) | Amount from booking; create Stripe PaymentIntent; return client_secret | Customer | `POST /api/payments/create-intent` (booking_id, amount_cents) |
| 4.2 | Confirm payment (booking) | Confirm booking after successful payment; update booking status | Customer | Stripe webhook `payment_intent.succeeded` → confirm booking |
| 4.3 | One-off donation (donate page) | Donation amount; one-time PaymentIntent; optional receipt email | Guest, Customer | `POST /api/payments/donate` |
| 4.4 | Chat-queue minimum payment | Min $1 (or configurable) to join queue; PaymentIntent or Checkout Session | Customer | `POST /api/payments/queue-entry` (amount_cents) |
| 4.5 | Saved payment methods | Attach customer to Stripe Customer; list and delete payment methods | Customer | `GET /api/payments/methods`, `POST /api/payments/methods`, `DELETE /api/payments/methods/:id` |
| 4.6 | Webhooks | Handle `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.updated`; idempotency | Backend | `POST /api/webhooks/stripe` (Bun server or Next.js route) |
| 4.7 | Refunds / disputes | Admin-initiated refunds; log disputes (Stripe webhooks) | Admin | `POST /api/payments/refund` (admin); webhook handlers |

**Interfaces:** `/payment` (booking), `/donate`, `/chat-queue` (min donation), `/profile` (Settings → Payment methods). Super Admin: Stripe config (e.g. keys, products).

---

### Phase 5 — Open Chat Queue

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 5.1 | Join queue | After min payment: add user to queue; return queue position and estimated wait | Customer | `POST /api/queue/join` (payment_ref or session_id) |
| 5.2 | Queue position / wait time | Realtime or polling: position, estimated minutes | Customer | `GET /api/queue/me` or WebSocket `queue:position` |
| 5.3 | Listener “next in queue” | Assign next waiting customer to available listener | Listener | `GET /api/queue/next` or push via WebSocket |
| 5.4 | Leave queue | User leaves before being matched; optional refund policy | Customer | `POST /api/queue/leave` |
| 5.5 | Listener availability (queue) | Listeners mark “available for queue”; count for “listeners available now” | Listener, System | `PATCH /api/listeners/me/queue-available`; aggregate in `GET /api/queue/stats` |

**Interfaces:** `/chat-queue` (Customer); Listener dashboard (queue panel). Community widget uses `GET /api/queue/stats` (listeners available, approx wait).

---

### Phase 6 — Realtime: Voice & Chat

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 6.1 | Session token / room | Create a unique room or token for session (e.g. Twilio Room or LiveKit/WebRTC); link to booking/queue session | Customer, Listener | `POST /api/sessions/:id/room` → returns token/URL |
| 6.2 | Voice (phone) | WebRTC or Twilio-based voice; start/end call; record (optional, with consent) | Customer, Listener | Token + client SDK (e.g. Twilio, LiveKit); `PATCH /api/sessions/:id` (started/ended) |
| 6.3 | Real-time chat | WebSocket or managed service (e.g. Ably, Pusher, or custom WS); send/receive messages; history | Customer, Listener | `WS /api/ws/session/:id` or `POST /api/sessions/:id/messages` + SSE/polling fallback |
| 6.4 | Session state | Started, ended, duration, disconnect handling | Both | `PATCH /api/sessions/:id` (status, ended_at); heartbeat/leave detection |
| 6.5 | Notifications (in-session) | “Listener joined”, “Call ended”, typing indicators (chat) | Both | Via same realtime channel |
| 6.6 | Safety disconnect | Team member can disconnect call/chat if threatened or inappropriate; record reason | Listener | `PATCH /api/sessions/:id` (status=ended, endReason=threatened|inappropriate) |
| 6.7 | Phone dialer | Only team member initiates phone call via website dialer for appointment (consumer cannot call in) | Listener | Session start flow: listener gets room/token and dials from in-session UI |

**Interfaces:** Customer: “Start Call” / “Open Chat” from profile or in-session page. Listener: same session room from dashboard; only listener dials for phone. Realtime server can be part of Bun backend (WebSocket) or separate (e.g. LiveKit server).

---

### Phase 7 — Listener Dashboard & Availability

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 7.1 | Listener login | Same auth; role listener; redirect to `/listener` (or `/dashboard/listener`) | Listener | Same auth; role check in middleware |
| 7.2 | Set availability (schedule) | Weekly or calendar-style availability for scheduled bookings | Listener | `GET/PUT /api/listeners/me/availability` |
| 7.3 | Queue availability toggle | “Available for open queue” on/off | Listener | `PATCH /api/listeners/me/queue-available` |
| 7.4 | Today’s sessions list | Upcoming scheduled sessions and queue assignments | Listener | `GET /api/listeners/me/sessions?date=` |
| 7.5 | Accept / decline (queue) | Accept or decline next queue customer (with reason if needed) | Listener | `POST /api/queue/accept`, `POST /api/queue/decline` |
| 7.6 | Start session (voice/chat) | Start session from dashboard; generate room/link; notify customer; only team member dials for phone | Listener | `POST /api/sessions/:id/start` → room token; realtime event to customer |
| 7.7 | End session | Mark session ended; duration; optional feedback; safety disconnect with reason | Listener | `PATCH /api/sessions/:id` (status=ended, endReason optional) |
| 7.8 | Session notes (listener) | Notes after session; visible to other team members for same consumer (resolution, situation, next steps) | Listener | `POST /api/sessions/:id/notes`; notes linked to consumer profile |
| 7.9 | View consumer profile before session | Team member sees consumer profile and signup answers before joining session | Listener | `GET /api/sessions/:id` or `GET /api/admin/users/:id` (consumer profile + signup data) |
| 7.10 | Team member profile stats | Hours worked, calls and chats count for week and month; 15 hr/week cap (1099) | Listener | `GET /api/listeners/me` or `GET /api/listeners/me/stats` (hours, callsCount, chatsCount by week/month) |
| 7.11 | No auto next session | Next session does not auto-pop; team member must debrief then explicitly take next | Listener | Queue “next” and session assignment only after listener is ready (e.g. “I’m ready” or after debrief timer) |

**Interfaces:** New **Team member portal** (`/team-member` or `/workforce`): sidebar, profile with hours/calls/chats, availability, queue panel, session list, view consumer profile, “Start call/chat” actions, debrief before next.

---

### Phase 8 — Session & Call Management

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 8.1 | Session model | Session = scheduled booking or queue match; status: pending, in_progress, completed, cancelled, no_show; default length e.g. 15 min | All | DB model; `GET /api/sessions/:id` |
| 8.2 | 14-minute warning and auto-end | System warns around 14 min; team member can end appropriately or add time; then auto-end flow | Listener, System | Timer in session UI; `PATCH /api/sessions/:id` (extend); auto-end at limit |
| 8.3 | Extend session (5–10 min) | Team member can add 5–10 minutes via extension button if needed | Listener | `PATCH /api/sessions/:id` (extendMinutes=5 or 10) or extend end time |
| 8.4 | Session history (customer) | Past sessions with date, listener, type, notes (if shared), documents | Customer | `GET /api/sessions?user=me&status=completed` |
| 8.5 | Documents (e.g. notes PDF) | Generate or upload session summary/notes; download | Customer | `GET /api/sessions/:id/documents`, `GET /api/sessions/:id/documents/:docId/download` |
| 8.6 | Post-session email to consumer | Automatic email after every chat/phone: synopsis of conversation + encouraging words | System | Background job or webhook after session end; email template; send to consumer |
| 8.7 | No-show handling | Mark no-show after N minutes; free slot for others; optional policy | Listener, System | `PATCH /api/sessions/:id` (no_show); cron or job |
| 8.8 | Reminders | Email/SMS before session (e.g. 24h, 15 min) | System | Background job; use booking + user contact info |
| 8.9 | In-session follow-up booking | From active call/chat: team member books follow-up (script: free vs paid); if paid, consumer receives email with payment link only | Listener, System | See Phase 3.7; booking created from session; payment link email sent to consumer; no payment UI for team member |

**Interfaces:** Customer: Profile → Conversations, Documents. Listener: session list, extend/end, notes, “Schedule follow-up” in-session. Admin: session list and reports.

---

### Phase 9 — Admin Interface

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 9.1 | Admin dashboard | Overview: active listeners, today’s sessions, queue length, recent donations; full website control | Admin | `GET /api/admin/stats` |
| 9.2 | Listener (team member) management | List listeners; add in backend (create username for team member); edit; remove/deactivate (hiring/firing) | Admin | `GET/POST/PATCH /api/admin/listeners` |
| 9.3 | Monitor team member hours | View and manage team member hours; weekly/monthly; 15 hr/week cap (1099) | Admin | `GET /api/admin/listeners/:id/hours` or in reports; enforce cap in availability/scheduling |
| 9.4 | Monitor chat and phone sessions | View live and historical sessions; access to session records (e.g. chat transcript, optional call recording for compliance/quality) | Admin | `GET /api/admin/sessions`; optional: session transcript/recording storage and playback |
| 9.5 | User list (consumers) | Search, view profile, **delete** profile, **reinstate** profile | Admin | `GET /api/admin/users`, `PATCH /api/admin/users/:id` (disable/delete), `POST /api/admin/users/:id/reinstate` |
| 9.6 | Content: community rooms | Edit room titles, descriptions, order (for `/community`) | Admin | `GET/PATCH /api/admin/content/rooms` |
| 9.7 | Reports | Sessions per period, revenue, listener utilization, queue stats, hours | Admin | `GET /api/admin/reports?from=&to=&groupBy=` |
| 9.8 | Refunds & support | Initiate refund; link to Stripe dashboard; internal notes | Admin | `POST /api/payments/refund`; internal notes in DB |

**Interfaces:** New **Admin** app under `/admin`: layout, sidebar (Dashboard, Listeners, Hours, Sessions, Users, Content, Reports, Support).

---

### Phase 10 — Super Admin

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 10.1 | Super admin dashboard | Platform health, revenue, user/listener counts, critical alerts | Super Admin | `GET /api/super-admin/stats` |
| 10.2 | Organisation/tenant config | Name, logo, support email, crisis links, timezone | Super Admin | `GET/PATCH /api/super-admin/config` |
| 10.3 | Feature flags | Toggle: open queue, donations, free booking option, etc. | Super Admin | `GET/PATCH /api/super-admin/features` |
| 10.4 | Stripe / billing config | Connect Stripe (or keys), products/prices for booking/donation; webhook URL | Super Admin | `GET/PATCH /api/super-admin/billing` (metadata only; keys in env) |
| 10.5 | Role assignment | Promote user to admin/listener; demote | Super Admin | `PATCH /api/super-admin/users/:id/role` |
| 10.6 | Audit log | Log sensitive actions (role change, config change, refund) | Super Admin | `GET /api/super-admin/audit-log` |
| 10.7 | System notifications | Email/SMS provider config; templates (optional) | Super Admin | `GET/PATCH /api/super-admin/notifications` |

**Interfaces:** New **Super Admin** app under `/super-admin`: separate layout and route group; restricted by role `super_admin`.

---

### Phase 11 — Content & Marketing

| # | Functionality | Description | Interface | API / Backend |
|---|---------------|-------------|-----------|---------------|
| 11.1 | Community rooms (CMS-like) | Titles, descriptions, order; optional images | Admin | Already in 9.5; `GET /api/content/rooms` for public |
| 11.2 | Crisis content | Crisis page content editable (links, copy) | Admin / Super Admin | `GET/PATCH /api/content/crisis` |
| 11.3 | Email: verification on signup | Automatic email on free profile signup; verify email; button redirect back to website | Backend | Send verification email; `GET /api/auth/verify-email?token=` redirect |
| 11.4 | Email: post-session synopsis | After every chat/phone: automatic email to consumer with synopsis of conversation + encouraging words | Backend | Template + send on session end |
| 11.5 | Email: receipt on payment | Receipt when consumer pays (booking, donation, queue) | Backend | Stripe receipt or custom email |
| 11.5b | Email: paid appointment booking (in-session) | When team member books a *paid* follow-up during a session: automated email to consumer with payment link only; team members never handle or see payment | Backend | On `POST /api/bookings` with isPaid from session context: send email with Stripe Checkout or payment link |
| 11.6 | Email: to team members and consumers | Ability to send emails to team members and consumers (ongoing campaigns/notices) | Admin | `POST /api/admin/send-email` or integration with email provider; list segments |
| 11.7 | Email templates | Booking confirmation, reminder, password reset, receipt | Backend | Stored in DB or code; send via provider (SendGrid, Resend, etc.) |
| 11.8 | Notifications (in-app) | Optional: in-app notification center for session reminders, system messages | Customer, Listener | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |

**Interfaces:** Public `/community`, `/crisis`; Admin/Super Admin for editing. Email: automatic (verify, post-session, receipt) + admin-sent to team/consumers. Notifications: bell icon in navbar (if implemented).

---

## 5. Modules and APIs — Summary by Interface

### Guest

| Module | APIs Used |
|--------|-----------|
| Public pages | `GET /api/content/rooms`, `GET /api/content/crisis` (if dynamic) |
| Donate | `POST /api/payments/donate` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password` |

### Customer

| Module | APIs Used |
|--------|-----------|
| Auth | Login, logout, reset password, verify email |
| Profile | `GET/PATCH /api/users/me`, profile setup, avatar, assigned listener |
| Booking | `GET /api/booking/availability`, `POST /api/bookings`, `PATCH /api/bookings/:id`, `GET /api/bookings` |
| Payments | Create intent (booking), donate, queue entry, `GET/POST/DELETE /api/payments/methods` |
| Queue | `POST /api/queue/join`, `GET /api/queue/me`, `POST /api/queue/leave` |
| Sessions | `GET /api/sessions`, `GET /api/sessions/:id`, `POST /api/sessions/:id/room`, documents |
| Realtime | Session room token; WebSocket or managed service for chat |

### Listener

| Module | APIs Used |
|--------|-----------|
| Auth | Same as customer; role listener |
| Availability | `GET/PUT /api/listeners/me/availability`, `PATCH /api/listeners/me/queue-available` |
| Sessions | `GET /api/listeners/me/sessions`, `POST /api/sessions/:id/start`, `PATCH /api/sessions/:id`, `POST /api/sessions/:id/notes` |
| Queue | `GET /api/queue/next`, `POST /api/queue/accept`, `POST /api/queue/decline` |
| Realtime | Same session room and chat as customer |

### Admin

| Module | APIs Used |
|--------|-----------|
| Dashboard | `GET /api/admin/stats` |
| Listeners | `GET/POST/PATCH /api/admin/listeners` |
| Sessions | `GET /api/admin/sessions` |
| Users | `GET /api/admin/users`, `PATCH /api/admin/users/:id` |
| Content | `GET/PATCH /api/admin/content/rooms` |
| Reports | `GET /api/admin/reports` |
| Payments | `POST /api/payments/refund` (with admin context) |

### Super Admin

| Module | APIs Used |
|--------|-----------|
| All above (read-only or as override) | — |
| Config | `GET/PATCH /api/super-admin/config` |
| Features | `GET/PATCH /api/super-admin/features` |
| Billing | `GET/PATCH /api/super-admin/billing` |
| Users & roles | `PATCH /api/super-admin/users/:id/role` |
| Audit | `GET /api/super-admin/audit-log` |
| Notifications | `GET/PATCH /api/super-admin/notifications` |

---

## 6. API List (Backend — BunJS)

Suggested base URL: `https://api.ourearsareopen.com` or same origin with Next.js proxy.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (email, password, optional name) |
| POST | `/api/auth/login` | Login; set session/JWT |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |
| GET  | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/verify-email` | Resend verification |
| GET  | `/api/auth/me` | Current user + role |

### Users (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/users/me` | Current user profile |
| PATCH  | `/api/users/me` | Update profile |
| GET    | `/api/users/me/setup-status` | Onboarding completion |
| POST   | `/api/users/me/avatar` | Upload avatar |
| GET/PATCH | `/api/users/me/assigned-listener` | Optional assigned listener |

### Booking

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/booking/preferences` | Listener preference options |
| GET  | `/api/booking/availability` | Available slots (query: date, type) |
| POST | `/api/bookings` | Create booking |
| POST | `/api/bookings/:id/hold` | Hold slot (optional) |
| GET  | `/api/bookings` | My bookings (query: status) |
| GET  | `/api/bookings/:id` | Booking detail |
| PATCH | `/api/bookings/:id` | Cancel or reschedule |

### Payments

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/payments/create-intent` | PaymentIntent for booking |
| POST   | `/api/payments/donate` | One-off donation |
| POST   | `/api/payments/queue-entry` | Min payment for queue |
| GET    | `/api/payments/methods` | Saved payment methods |
| POST   | `/api/payments/methods` | Attach payment method |
| DELETE | `/api/payments/methods/:id` | Remove method |
| POST   | `/api/payments/refund` | Refund (admin) |
| POST   | `/api/webhooks/stripe` | Stripe webhooks |

### Queue

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/queue/join` | Join queue (after payment) |
| GET  | `/api/queue/me` | My position & wait |
| POST | `/api/queue/leave` | Leave queue |
| GET  | `/api/queue/stats` | Listeners available, approx wait (public/widget) |
| GET  | `/api/queue/next` | Next customer (listener) |
| POST | `/api/queue/accept` | Accept (listener) |
| POST | `/api/queue/decline` | Decline (listener) |

### Sessions

| Method | Path | Description |
|--------|------|-------------|
| GET   | `/api/sessions` | My sessions (customer or listener) |
| GET   | `/api/sessions/:id` | Session detail |
| POST  | `/api/sessions/:id/room` | Get room/token for voice or chat |
| PATCH | `/api/sessions/:id` | Start, end, no-show, extend (+5 min), safety disconnect (endReason) |
| POST  | `/api/sessions/:id/notes` | Listener notes (shared for same consumer) |
| GET   | `/api/sessions/:id/documents` | List documents |
| GET   | `/api/sessions/:id/documents/:docId/download` | Download document |

### Listeners (self)

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/listeners/me` | My listener profile |
| GET  | `/api/listeners/me/stats` | My stats: hours worked, calls/chats count for week and month (15 hr/week cap) |
| GET  | `/api/listeners/me/availability` | My availability |
| PUT  | `/api/listeners/me/availability` | Set availability |
| PATCH | `/api/listeners/me/queue-available` | Toggle queue availability |
| GET  | `/api/listeners/me/sessions` | My sessions (by date) |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET   | `/api/admin/stats` | Dashboard stats |
| GET   | `/api/admin/listeners` | List listeners |
| POST  | `/api/admin/listeners` | Invite/add listener |
| PATCH | `/api/admin/listeners/:id` | Edit listener |
| GET   | `/api/admin/sessions` | All sessions (filtered) |
| GET   | `/api/admin/users` | List users (filtered) |
| PATCH | `/api/admin/users/:id` | Update user (disable, delete) |
| POST  | `/api/admin/users/:id/reinstate` | Reinstate deleted/disabled profile |
| GET   | `/api/admin/listeners/:id/hours` | Team member hours (weekly/monthly, 15 hr cap) |
| GET   | `/api/admin/content/rooms` | Community rooms |
| PATCH | `/api/admin/content/rooms` | Update rooms |
| GET   | `/api/admin/reports` | Reports (sessions, revenue, etc.) |

### Super Admin

| Method | Path | Description |
|--------|------|-------------|
| GET   | `/api/super-admin/stats` | Platform stats |
| GET   | `/api/super-admin/config` | Org config |
| PATCH | `/api/super-admin/config` | Update config |
| GET   | `/api/super-admin/features` | Feature flags |
| PATCH | `/api/super-admin/features` | Update flags |
| GET   | `/api/super-admin/billing` | Billing metadata |
| PATCH | `/api/super-admin/billing` | Update billing config |
| PATCH | `/api/super-admin/users/:id/role` | Set role |
| GET   | `/api/super-admin/audit-log` | Audit log |
| GET   | `/api/super-admin/notifications` | Notification config |
| PATCH | `/api/super-admin/notifications` | Update templates/provider |

### Content (public or minimal auth)

| Method | Path | Description |
|--------|------|-------------|
| GET   | `/api/content/rooms` | Community rooms (for `/community`) |
| GET   | `/api/content/crisis` | Crisis page content |

---

## 7. Database (MongoDB) — Collections & Key Fields

| Collection | Purpose | Key Fields (conceptual) |
|------------|---------|-------------------------|
| **users** | All users (customers, listeners, admins) | email, passwordHash, role, profile (name, phone, avatar, preferences), assignedListenerId, emailVerified, createdAt |
| **listeners** | Listener profile (1:1 with user when role=listener) | userId, username (admin-created), availability (slots), queueAvailable, bio, languages, hoursThisWeek (for 15 hr cap), createdAt |
| **bookings** | Scheduled sessions | userId, listenerId (optional), type (phone/chat), slot, concern, preferences, status, paymentIntentId, createdAt |
| **sessions** | Actual session (from booking or queue) | bookingId (optional), queueRef (optional), userId, listenerId, status, startedAt, endedAt, roomId, notes (listener only) |
| **payments** | Payment records (idempotency + audit) | stripePaymentIntentId, userId, amountCents, type (booking/donation/queue), refId (booking/session), status, createdAt |
| **queue_entries** | Open queue | userId, paymentId, status (waiting/assigned/left), position, assignedListenerId, createdAt |
| **documents** | Session documents (notes PDF, etc.) | sessionId, type, urlOrKey, createdAt |
| **content_rooms** | Community rooms | title, description, order, slug |
| **content_crisis** | Crisis page content | blocks (rich text or structured) |
| **audit_log** | Super admin audit | actorId, action, resource, meta, createdAt |
| **feature_flags** | Super admin flags | key, enabled, meta |
| **org_config** | Super admin org config | key-value or structured |

Use indexes on: `users.email`, `users.role`, `bookings.userId`, `bookings.status`, `bookings.slot`, `sessions.listenerId`, `sessions.status`, `queue_entries.status`, `payments.stripePaymentIntentId`.

---

## 8. Realtime & Calling (Professional Approach)

- **Voice:** Use **Twilio** or **LiveKit** for production-grade voice. Backend creates a room/token per session; frontend uses SDK to join. Store room SID in `sessions` and update on end.
- **Chat:** Use **WebSocket** on Bun server for in-session text, or **Ably/Pusher** for managed realtime. Persist messages in a `session_messages` collection if history is required.
- **Queue:** Use WebSocket or SSE to push “queue position” and “listener assigned” to the customer, and “next customer” to the listener.
- **Presence:** Listener “available for queue” and “in session” can be tracked in DB and exposed via `GET /api/queue/stats` and WebSocket for live widget (e.g. community page).

---

## 9. Stripe Integration (Professional Approach)

- **Products/Prices:** Create Stripe Products for “15-min phone”, “15-min chat”, “Donation”, “Queue entry”. Store price IDs in config or env.
- **Payment Intents:** Use Payment Intents for one-off payments (booking, donation, queue). Store `payment_intent.id` and link to booking/session/donation record.
- **Customers:** Create Stripe Customer on first payment or when user adds payment method; store `stripeCustomerId` on user.
- **Webhooks:** Verify signature; handle `payment_intent.succeeded`, `payment_intent.payment_failed`; idempotent by `payment_intent.id`. Run idempotency key for duplicate events.
- **Refunds:** Use Stripe Refunds API from admin/super-admin flow; log in `payments` and audit.

---

## 10. Pages & Routes (Next.js) — Consolidated List

### Public (Guest)

- `/` — Home  
- `/about` — About  
- `/community` — Community rooms + chat queue widget  
- `/book-listener` — Book a listener (redirect to login if required)  
- `/donate` — Donate  
- `/crisis` — Crisis resources  
- `/contact` — Contact form  
- `/join-team` — Careers + volunteer  
- `/login` — Login  
- `/register` — Register (with optional `?returnUrl=`)  
- `/volunteer` — Volunteer application  

### Customer (authenticated)

- `/profile` — Profile (Conversations, Documents, Info, Settings)  
- `/profile/setup` — Post-signup setup  
- `/payment` — Booking payment (and redirect back from Stripe if needed)  
- `/chat-queue` — Open queue (min donation then join)  
- `/session/[id]` — **New:** In-session page (voice/chat room)  

### Listener / Team member (authenticated, role listener)

- `/team-member` or `/workforce` — **New:** Team member portal (per requirements); only team members and admin. Profile (hours, calls/chats week/month), appointments, chat queue, start/end session, debrief, notes.  
- `/listener` — Optional alias to same portal.  
- `/session/[id]` — Same in-session page for listener (only listener dials for phone).  

### Admin (authenticated, role admin)

- `/admin` — **New:** Admin layout  
- `/admin/dashboard` — Stats  
- `/admin/listeners` — Listener management  
- `/admin/sessions` — Session list  
- `/admin/users` — User list  
- `/admin/content` — Rooms / crisis content  
- `/admin/reports` — Reports  

### Super Admin (authenticated, role super_admin)

- `/super-admin` — **New:** Super admin layout  
- `/super-admin/dashboard` — Platform stats  
- `/super-admin/config` — Org config  
- `/super-admin/features` — Feature flags  
- `/super-admin/billing` — Stripe/billing config  
- `/super-admin/users` — Role assignment  
- `/super-admin/audit` — Audit log  
- `/super-admin/notifications` — Notification config  

---

## 11. Design & UX Notes (From Current Codebase)

- **Crisis:** Prominent crisis banner on booking and chat-queue; persistent Crisis Help button in layout. Keep this pattern.
- **Booking flow:** Multi-step (type → concern → preferences → date/time → info) already in place; wire to APIs and add availability.
- **Profile:** Tabs (Conversations, Documents, Info, Settings) and “Start Call” / “Open Chat” already designed; link to real session room.
- **Payments:** Order summary and card form exist; replace with Stripe Elements and PaymentIntent flow.
- **Chat queue:** Donation form and “listeners available” copy exist; add real queue and payment.

---

## 12. Out of Scope (For Later)

- Native mobile apps (consider responsive web first).  
- Video sessions (only phone + chat in scope).  
- Multi-language UI (data preferences only for now).  
- Full CRM or ticketing for general support (admin “support” is refunds + notes).  
- White-label / multi-tenant (single org assumed; super_admin config is org-level).  
- **Payroll:** Full payroll system is out of scope; requirement is to *assist* in creating payroll tracking and to integrate with a purchased system later. Team members get paid weekly on Friday; hours and session data from this platform can feed that integration.

**Aligned with PDF §9 (Out of Scope):** Consumer inbound calls; off-platform comms; no payment processing by team members; payroll system development (third-party to be procured).

---

## 12b. Assumptions & Notes (per PDF §10)

- **1099 only (initial phases):** Platform will operate with 1099 contractors only; no W-2 employees in initial scope.
- **Phased rollout:** Build supports phased rollout; initial scope focuses on core chat, phone, and admin functionality.
- **Session scripts:** All session scripts (e.g. for in-session follow-up booking, free vs paid) will be provided by the client prior to development.
- **Payroll:** A third-party payroll tool will be selected by the client and supplied for integration; platform will expose hours/session data as needed.
- **Domain and hosting:** Domain and hosting environment will be provided or procured by the client.

---

## 13. Requirements Cross-Reference (Client Document)

The following table maps the **client requirements document** and the **Scope of Work PDF (v2.0, March 11, 2026)** to this scope.

### Team members

| Req | Requirement | Maps to scope |
|-----|-------------|---------------|
| TM1 | Dedicated link (e.g. ourearsareopen.com/team-member or /workforce); only team members and admin | Section 2 (Access); Section 10: `/team-member`, `/workforce`; Phase 7 |
| TM2 | Team member logs in with username (created by admin) and password set on first sign-in | Phase 1 (1.7); Phase 7 — admin-created listener accounts, first-time password set |
| TM3 | On login: profile page with hours, calls/chats for week and month; 15 hr/week cap (1099) | Phase 7 (7.10); `GET /api/listeners/me/stats`; Phase 9 (9.3) for admin monitor |
| TM4 | All communication on website only (no off-site; termination if violated); view consumer profile/signup answers before session | Section 2 (Business rules); Phase 7 (7.9) — view consumer profile |
| TM5 | Join phone session and chat session via website; if no appointments, jump into chat queue | Phase 5, 6, 7 — queue, session start, chat queue only (no phone queue) |
| TM6 | No phone queue; only chat queue; phone only by appointment | Section 2 (Business rules); Phase 5 |
| TM7 | Team member can disconnect if threatened or inappropriate | Phase 6 (6.6); `PATCH /api/sessions/:id` with endReason |
| TM8 | Auto end around 14-minute mark; team member can end appropriately | Phase 8 (8.2) — 14-min warning, auto-end flow |
| TM9 | Team member can add more time (5–10 min) | Phase 8 (8.3); `PATCH /api/sessions/:id` extend |
| TM10 | No auto pop-up next session; debrief; notes on profile for next team member | Phase 7 (7.8, 7.11) — debrief, shared notes for same consumer |
| TM11 | Only team member dials via website dialer for appointment | Phase 6 (6.7); Phase 7 (7.6) — phone initiated by listener only |
| TM12 | In-session follow-up booking (PDF §3.5) | When session reaches time limit, team member can schedule follow-up during call/chat; script free vs paid; if paid → email consumer with payment link; no payment UI for team members | Phase 3 (3.7), Phase 8 (8.9), Phase 11 (11.5b) |

### Consumer

| Req | Requirement | Maps to scope |
|-----|-------------|---------------|
| C1 | Free profile | Phase 1 (1.1), Phase 2 — registration, profile |
| C2 | Chat queue: min $1 donation (can pay more) | Phase 4 (4.4), Phase 5 — queue entry payment |
| C3 | No call-in hotline | Section 2 (Business rules); consumer never dials |
| C4 | Chat without appointment only on website | Phase 5 — open chat queue |
| C5 | All phone by appointment | Phase 3 (Booking); Section 2 (Business rules) |

### Administrative staff

| Req | Requirement | Maps to scope |
|-----|-------------|---------------|
| A1 | Control entire website | Phase 9 — Admin interface |
| A2 | Delete and reinstate profiles | Phase 9 (9.5); `PATCH /api/admin/users/:id`, `POST .../reinstate` |
| A3 | Monitor chat and phone calls | Phase 9 (9.4) — session list, duration, status |
| A4 | Add team members in backend | Phase 9 (9.2); Phase 1 (1.7) — create listener with username |
| A5 | Monitor team member hours | Phase 9 (9.3); `GET /api/admin/listeners/:id/hours` |
| A6 | Email: on free profile signup (verify); after conversation (synopsis + encouraging words); receipt on payment | Phase 11 (11.3, 11.4, 11.5) — verification, post-session email, receipt |
| A7 | Hiring/firing: add or remove team members in backend | Phase 9 (9.2) — add/listeners, remove/deactivate |
| A8 | Payment solution | Phase 4 — Stripe |
| A9 | Payment processing | Phase 4 — Stripe integration |

### Email system

| Req | Requirement | Maps to scope |
|-----|-------------|---------------|
| E1 | On free signup: verify email; automatic email; button redirect back to website | Phase 1 (1.5); Phase 11 (11.3) |
| E2 | After every chat/phone: email to consumer with synopsis + encouraging words | Phase 8 (8.6); Phase 11 (11.4) |
| E3 | Send emails to team members and consumers (ongoing) | Phase 11 (11.6) |
| E4 | Paid appointment booking (in-session): email to consumer with payment link; team members never handle payment | Phase 11 (11.5b); Phase 3 (3.7) |

### Full functionality list

| # | Requirement | Maps to scope |
|---|-------------|---------------|
| 1 | Functional backend with chat and phone | Phases 6, 8; Bun backend, WebSocket, voice (Twilio/LiveKit) |
| 2 | Team member profiles | Phase 7; listener profile, stats (hours, calls, chats) |
| 3 | Administrative profiles | Phase 9 — Admin interface |
| 4 | Consumers: profiles, book, chat, talk | Phases 1, 2, 3, 5, 6 |
| 5 | Track team members and consumers | Phase 9 — listeners, users, hours, sessions |
| 6 | Email system | Phase 11 — verify, post-session, receipt, send to team/consumers |
| 7 | Payment, payment tracking | Phase 4 — Stripe, webhooks, receipts |
| 8 | Booking calendar | Phase 3 — availability, bookings; in-session follow-up booking (Phase 3.7, 8.9) |
| 9 | Open queue on chat | Phase 5 — chat queue only |
| 10 | Monitor phone and chat sessions (live and recorded) | Phase 9 (9.4) — session list, duration, status; optional transcript/recording storage and playback |
| 11 | Payroll tracking (assist; integrate purchased system; weekly Friday pay) | Section 12 (Out of scope — assist/integrate); hours data can feed integration |

---

This document is the single source of truth for scope. Implement in the order of phases 1–11, with Auth and Payments as the backbone for the rest.
