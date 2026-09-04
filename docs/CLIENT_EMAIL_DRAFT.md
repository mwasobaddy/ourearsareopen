# Client Email — What We Need From You to Finalize the Project

**Subject:** Our Ears Are Open — final steps to launch 🚀

---

Dear [Client Name],

Great progress! The platform is built and the core experience is fully functional end-to-end. To finish and go live, there are a handful of **accounts, credentials, and settings only you can provide**. The list below tells you exactly what we need, how to get it, and where we'll use it.

Two quick clarifications up front:

- Every item is **on your side** — nothing here blocks the work already done, it just unlocks the last 10% (live email, phone calls, card payments, login buttons).
- Nothing sensitive is shared here; these are instructions, not secret values. Send keys only through the secure channel we've been using (never paste into chat).

---

## ✅ What's ALREADY DONE (ready now)

The following is **live and working** on the Next.js + Supabase stack:

- **Auth & users** — real registration, login/logout, session persistence, protected routes, password reset, role-based redirect; profiles auto-created on signup.
- **Profile & onboarding** — multi-step `/profile/setup` wizard, avatar upload to storage, full profile CRUD, delete-account, assigned-listener display.
- **Booking (scheduled sessions)** — multi-step book-listener flow that creates real bookings; upcoming/past history; **cancel**, **reschedule**, and **no-show** handling; optional free/phone options driven by feature flags.
- **Open chat queue** — real queue with live position, join after (min $1) payment, listener availability toggle, accept/assign, **leave queue**, viewed-consumer pool, and "listeners available now" counts.
- **Realtime chat** — in-session text chat with full history over Supabase Realtime (no page refresh).
- **Session management** — full lifecycle, **15-min default with 14-min warning + auto-end + 5-min extend**, **safety-disconnect with reason**, **debrief pause** before next session, listener notes, session-notes documents + PDF/print, 15 hr/week cap enforcement.
- **Listener (team member) portal** — queue panel, weekly availability, dashboard with hours/calls/chats and 15-hr cap, today's appointments, consumer-profile view, mark no-show, session list.
- **Admin interface** — role-guarded dashboard (stats), listener management, hours monitor, session monitor, consumer management (deactivate/reactivate), reports, refund/support tickets.
- **Super admin** — platform health, org config, **feature flags**, role assignment, audit log, billing status.
- **Content & marketing** — admin-editable community rooms + crisis resources (live on `/community` and `/crisis`), email templates editor, **in-app notification center** (navbar bell + inbox).

The site is deployed-ready; the remaining items are all **client-supplied integrations** below.

---

## 🟡 Items We Need From You (how to get each)

### 1. Supabase — turn ON email confirmation
- **Why:** Forces new consumer signups to verify their email before signing in (a hard requirement).
- **Where:** Supabase Dashboard → Authentication → Providers → Email → toggle **"Confirm email" ON**.
- **How to get there:** Log in at [supabase.com](https://supabase.com) → your project (already shared) → Authentication → Providers.

### 2. Resend — email sending (verification, password reset, receipts, post-session synopsis, reminders)
- **What:** An **API key** + a **verified public domain** (DNS access required — the domain you control, e.g. `ourearsareopen.org`). Resend **will not** send from a `*.vercel.app`/free hostname.
- **How to get:** Sign up at [resend.com](https://resend.com) (free tier available), **add + DNS-verify a domain you own**, then create an **API Key** (Permissions: **Sending access**).
- **Send us:** the API key + the verified from-address (they go in `RESEND_API_KEY`).
- **Notes:** Used by password reset, booking confirmations, session synopsis after every chat/phone, and 24h reminders.
- 📄 **Follow the step-by-step guide:** see `docs/RESEND_EMAIL_SETUP_GUIDE.md` (buy/choose domain → add to Resend → paste DNS records → verify → update Supabase sender → test).

### 3. Stripe — payments
- **What:** **Secret** + **publishable** API keys, a **webhook signing secret**, and the webhook endpoint registered.
- **How to get:**
  1. Sign up / log in at [dashboard.stripe.com](https://dashboard.stripe.com).
  2. Start in **Test mode** → Developers → API keys → copy **Secret** (`sk_test_…`) and **Publishable** (`pk_test_…`).
  3. Deploy once, then register the webhook: Developers → Webhooks → Add endpoint → point at `POST https://<your-domain>/api/webhooks/stripe` and select events `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` → copy the **Signing secret** (`whsec_…`).
  4. Enable the card methods you want (Card required; optionally Link, Apple Pay, Google Pay, Klarna, PayPal) under Settings → Payment methods.
- **Send us:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. (We'll switch from test → live when you're ready.)
- **Notes:** We will also add a recurring-donation price (for the "Monthly" donate tab) — tell us the amount or we'll use a sensible default.

### 4. Google + Apple OAuth — "Continue with Google/Apple" login
- **What:** OAuth client credentials.
- **Google:** Create an app at [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth client → copy **Client ID** + **Client secret**; add the callback URI from your Supabase project under Authentication → Providers → Google.
- **Apple:** Requires an Apple Developer account ([developer.apple.com](https://developer.apple.com)) → create Service ID + Key → copy **Service ID, Team ID, Key ID, private key**, and your domain.
- **Send us:** The values above (or paste them into the Supabase Google/Apple provider screens directly — we can walk you through it).

### 5. Twilio — voice calls + SMS reminders
- **What:** Account SID + Auth Token + a phone number (voice **and** SMS-capable).
- **How to get:** Sign up at [twilio.com](https://twilio.com), buy a number, and verify your caller ID.
- **Send us:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
- **Notes:** Powers the **phone dialer** (only the team member dials for appointments) and the **15-minute SMS reminders**. Alternatively, tell us if you'd prefer **LiveKit** for voice and we'll take that path.

### 6. Production deployment + domain
- **What:** A hosting target for the app + a custom domain (recommended: **Vercel**).
- **How to get:** Create a project at [vercel.com](https://vercel.com), connect the repo, add a domain that points to Vercel. We'll handle the config and give you the deploy URL.
- **Send us:** Vercel project access + the custom domain.

### 7. Brand / legal content
- **What:** The copy for **Terms of Service**, **Privacy Policy**, and **Cancellation Policy** pages, plus your **501(c)(3)** note.
- **How to get:** Anywhere you host your legal docs (or we can write drafts for your review).
- **Send us:** The content or links.

---

## ▶️ What we'll do immediately once we have items 2–5

1. Apply the credentials to the environment and restart.
2. Send a real test **verification** email, a **booking confirmation**, a **receipt**, and a **post-session synopsis** to confirm delivery.
3. Run a live **card payment** through `/payment` (test mode, then live) and verify the webhook confirms the booking.
4. Make a **real phone call** via the website dialer and confirm voice + duration tracking.
5. Turn on **email confirmation** and **OAuth login** and verify both.
6. Final end-to-end QA across consumer, listener, admin, and super-admin flows; then deploy to production.

---

## 🎯 Bottom line
- **Done today:** auth, profiles, booking, chat queue, realtime chat, session management (timing/safety/no-show/reschedule/notes/documents), listener portal, admin + super-admin, content, notifications.
- **Final unlocked-by-you:** live email, live card payments + receipts, voice calls + SMS reminders, OAuth login buttons, email confirmation enforcement, production deploy, legal content.

You can split this over a few sittings — test-mode is fine for Stripe/Twilio first, and nothing expires. Reply with any questions or send along the first item (often easiest to start with the **Supabase email toggle** + **Resend** key).

Best,
Your development team