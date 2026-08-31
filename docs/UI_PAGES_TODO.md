# UI Pages — Build Checklist

Use this checklist to track creation of all remaining UI pages. Pages marked **(exists)** already exist and may need enhancement only.

---

## Phase A: Shared & Auth Pages

### Auth (all roles)
- [ ] `/login` — Customer/login form; add role detection and redirect to `/team-member` for listeners
- [ ] `/register` — Consumer signup (exists; wire to API)
- [ ] `/forgot-password` — Forgot password form; email input; submit → success message
- [ ] `/reset-password?token=` — Reset password form with token; new password fields; submit
- [ ] `/verify-email?token=` — Verification success/error page; button redirect to login or returnUrl
- [ ] `/team-member/login` — Optional: dedicated team member login (or use `/login` with role redirect)

---

## Phase B: Customer (Consumer) Pages

### Profile & Settings
- [ ] `/profile` — Profile dashboard (exists; wire to API; keep Conversations, Documents, Info, Settings tabs)
- [ ] `/profile/setup` — Post-signup setup wizard (exists; wire to API)
- [ ] `/profile/settings/notifications` — Notifications preferences (or modal from Settings tab)
- [ ] `/profile/settings/security` — Password change, 2FA (or modal from Settings tab)
- [ ] `/profile/settings/payment-methods` — Saved cards list; add/remove (or modal from Settings tab)

### Booking & Sessions
- [ ] `/payment` — Booking payment (exists; add Stripe Elements; wire to API)
- [ ] `/chat-queue` — Open queue + min donation (exists; add queue position UI; wire to API)
- [ ] `/session/[id]` — In-session page: voice/chat room; join call or chat; consumer view only (no dialer)

---

## Phase C: Team Member (Listener) Portal — Dashboard Style

### Layout & Entry
- [ ] `(team-member)/layout.tsx` — Dashboard layout: sidebar + header; nav: Dashboard, Appointments, Queue, Availability, Notes
- [ ] `/team-member` — Redirect to `/team-member/dashboard` or show dashboard directly
- [ ] `/team-member/dashboard` — Profile stats: hours (week/month), calls count, chats count; 15 hr cap indicator; today’s appointments summary; queue status

### Team Member Pages
- [ ] `/team-member/appointments` — Upcoming appointments list; Start Call / Open Chat buttons; no appointments → CTA to join queue
- [ ] `/team-member/queue` — Chat queue panel: next-in-line, Accept / Decline; availability toggle
- [ ] `/team-member/availability` — Weekly/calendar availability editor for scheduled bookings
- [ ] `/team-member/sessions` — Session history; past sessions with notes (read-only)
- [ ] `/team-member/profile` — Team member profile: name, contact; hours summary; optional edit
- [ ] `/session/[id]` — In-session page for team member: dialer (phone only), extend +5–10 min, disconnect, debrief, notes, in-session follow-up booking (no payment UI)

---

## Phase D: Admin Portal — Dashboard Style

### Layout & Entry
- [ ] `(admin)/layout.tsx` — Admin layout: sidebar + header; nav: Dashboard, Listeners, Sessions, Users, Content, Reports
- [ ] `/admin` — Redirect to `/admin/dashboard`
- [ ] `/admin/dashboard` — Stats: active listeners, today’s sessions, queue length, recent donations, quick links

### Admin Pages
- [ ] `/admin/listeners` — List team members; Add listener (create username); Edit; Deactivate; hours link
- [ ] `/admin/listeners/[id]` — Listener detail: profile, hours, sessions, availability
- [ ] `/admin/sessions` — Session list with filters (date, listener, status, type); view/link to session
- [ ] `/admin/users` — Consumer list; search; view profile; Delete; Reinstate
- [ ] `/admin/users/[id]` — Consumer profile detail; sessions; actions
- [ ] `/admin/content` — Tabs: Community Rooms; Crisis content; edit titles, descriptions, order
- [ ] `/admin/reports` — Reports: sessions per period, revenue, listener utilization, queue stats; date filters
- [ ] `/admin/support` — Refunds; initiate refund; internal notes; link to Stripe (or in Reports)

---

## Phase E: Super Admin Portal — Dashboard Style

### Layout & Entry
- [ ] `(super-admin)/layout.tsx` — Super admin layout: sidebar + header; nav: Dashboard, Config, Features, Billing, Users, Audit, Notifications
- [ ] `/super-admin` — Redirect to `/super-admin/dashboard`
- [ ] `/super-admin/dashboard` — Platform stats: revenue, user/listener counts, critical alerts

### Super Admin Pages
- [ ] `/super-admin/config` — Org config: name, logo, support email, crisis links, timezone
- [ ] `/super-admin/features` — Feature flags: open queue, donations, free booking, etc.; toggles
- [ ] `/super-admin/billing` — Stripe/billing metadata; products, prices, webhook URL (no keys)
- [ ] `/super-admin/users` — Role assignment: promote/demote admin, listener
- [ ] `/super-admin/audit` — Audit log list; filter by actor, action, date
- [ ] `/super-admin/notifications` — Email/SMS provider config; templates

---

## Phase F: Shared Layouts & Components

### Route Group Layouts
- [ ] `app/(team-member)/layout.tsx` — SidebarProvider, DashboardNav, role guard
- [ ] `app/(admin)/layout.tsx` — SidebarProvider, AdminNav, role guard
- [ ] `app/(super-admin)/layout.tsx` — SidebarProvider, SuperAdminNav, role guard

### Shared Dashboard Components
- [ ] `components/dashboard/DashboardNav.tsx` — Reusable sidebar with configurable nav items
- [ ] `components/dashboard/DashboardHeader.tsx` — Header: user menu, logout, breadcrumb
- [ ] `components/dashboard/StatsCard.tsx` — Card for dashboard stat blocks
- [ ] `components/dashboard/DataTable.tsx` — Reusable table with sort, filter, pagination (or use existing Table)

### Role-Based Routing
- [ ] Middleware or layout guard: redirect unauthenticated users to `/login`
- [ ] Middleware: redirect customers from `/admin`, `/team-member`, `/super-admin` to `/profile`
- [ ] Middleware: redirect listeners from `/admin`, `/super-admin` to `/team-member`
- [ ] Middleware: redirect admins from `/super-admin` to `/admin`; allow super_admin to access both

---

## Phase G: Existing Pages — Enhancements (if needed)

- [ ] `/` — Home (exists)
- [ ] `/about` — About (exists)
- [ ] `/community` — Community (exists)
- [ ] `/book-listener` — Book listener (exists; wire availability API)
- [ ] `/donate` — Donate (exists; wire Stripe)
- [ ] `/crisis` — Crisis (exists)
- [ ] `/contact` — Contact (exists)
- [ ] `/join-team` — Join team (exists)
- [ ] `/volunteer` — Volunteer (exists)
- [ ] `/workforce-apply` — Workforce application (exists)

---

## Navbar Updates (role-aware)

- [ ] Show different nav for Guest vs Customer vs Team Member vs Admin vs Super Admin
- [ ] Guest: Log In, Sign Up, Crisis Help
- [ ] Customer: Profile, Book, Chat Queue, Donate, Log Out
- [ ] Team Member: Team Member dashboard link, Log Out (minimal public nav or redirect)
- [ ] Admin: Admin dashboard link, Log Out
- [ ] Super Admin: Super Admin link, Admin link, Log Out

---

## Summary Count

| Category                 | New Pages | Exists (enhance) |
|--------------------------|-----------|------------------|
| Auth                     | 4         | 2                |
| Customer                 | 4         | 5                |
| Team Member              | 8         | 0                |
| Admin                    | 10        | 0                |
| Super Admin              | 9         | 0                |
| Layouts & shared         | 3 layouts + 4 components | — |
| **Total new routes**     | **~35**   | —                |

---

**Build order suggestion:** Phase F (layouts/components) → Phase A (auth) → Phase B (customer) → Phase C (team member) → Phase D (admin) → Phase E (super admin) → Navbar updates.
