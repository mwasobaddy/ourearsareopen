# Client Action Required — Stripe, Resend & Twilio Setup

**To:** Client
**From:** Development Team
**Subject:** Action Required: 3 configuration items to go live

---

Hi,

Everything is built and deployed — but three integrations need your credentials/configuration before they'll work live. Here's exactly what we need and why.

---

## 1. Stripe Webhook (Payments Will Not Confirm Without This)

**Problem:** Your Stripe webhooks are pointing to `https://www.ourearsareopen.com` (your homepage), but the handler lives at a different path. Right now, when someone pays, Stripe sends the event to the wrong URL — so bookings stay "pending" and receipts never send.

**What to do:**

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. **Edit** the webhook destination named `dynamic-spark-snapshot` and change the URL to:
   ```
   https://www.ourearsareopen.com/api/webhooks/stripe
   ```
3. **Delete** the second webhook (`dynamic-spark-thin`) — you only need one.
4. Copy the **Signing secret** from the snapshot webhook. It starts with `whsec_`.
5. In **Vercel → ourearsareopen → Settings → Environment Variables**, add:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
6. Redeploy.

**What breaks without it:** Paid bookings never confirm. Receipts don't send. The webhook handler never fires.

---

## 2. Resend Verified Domain (Emails Will Not Send Without This)

**Problem:** All transactional emails (welcome, booking confirmation, receipt, session synopsis, reminders, admin campaigns) are built and wired — but they safely no-op because Resend cannot send from an unverified domain. Right now, the sender is `noreply@ourearsareopen.vercel.app`, which fails DNS verification (Vercel domains can't be verified in Resend).

**What to do:**

1. In **Resend Dashboard → Domains**, add a domain you own (e.g. `ourearsareopen.com` or `mail.ourearsareopen.com`).
2. Add the DNS records Resend gives you (TXT, CNAME, MX) to your domain's DNS provider.
3. Wait for verification (usually a few minutes).
4. Once verified, set the **From address** in Vercel environment variables:
   ```
   EMAIL_FROM=noreply@ourearsareopen.com
   ```
   (Replace with your verified domain.)
5. Redeploy.

**What breaks without it:** No welcome emails, no booking confirmations, no receipts, no session summaries, no reminders, no admin campaign emails. The app works — but email is completely silent.

---

## 3. Twilio — the account is CLOSED (blocking voice calls)

**Problem we hit on 2026-10-06:** the Twilio credentials are present in the project, but the account they belong to is **not active**. Twilio's API returns:

```
20003 authentication failed, account AC9e947d… with status 4 is not active
```

Status `4` means the account is **closed** — most likely the free trial was closed or the account was cancelled. Every call attempt fails, so no one can place or receive a phone conversation. This is not a code problem and not a missing-key problem; the account itself needs attention.

**What to do:**

1. Log in at [twilio.com/console](https://twilio.com/console).
2. If the account shows as closed, either **reactivate it** (Twilio support can restore trial accounts) or **sign up for a new account**.
3. Buy/keep a Twilio phone number with **voice** capability (SMS capability separately if you want text reminders).
4. Add the new credentials in **Vercel → ourearsareopen → Settings → Environment Variables**:
   ```
   TWILIO_ACCOUNT_SID=AC…
   TWILIO_AUTH_TOKEN=…
   TWILIO_PHONE_NUMBER=+1…
   TWILIO_API_KEY_SID=SK…
   TWILIO_API_KEY_SECRET=…
   ```
5. Verify the consumer's phone number in the Twilio console (trial accounts can only call verified numbers).
6. Redeploy.

**What breaks without it:** phone conversations can't connect. The listener's "Call consumer" button returns a friendly notice ("Voice calling is unavailable — the Twilio account needs to be reactivated") and chat still works, so nothing breaks for the customer — but the voice feature is unavailable.

**Good news:** the plumbing is finished and tested. `POST /api/twilio/call` bridges the Twilio number → consumer → the listener's own phone (no TwiML app, no browser SDK needed), and `DELETE /api/twilio/call` hangs up. It picks the API key first and falls back to the account auth token automatically. The only thing missing is a live account.

---

## 4. CRON_SECRET (recommended, for booking reminders)

Booking reminder emails are now sent by a scheduled job (`vercel.json` → `/api/email/reminders`, hourly). The endpoint is open to anyone by default, which means a stranger could trigger it early.

**What to do:** in **Vercel → Settings → Environment Variables**, add any random string:

```
CRON_SECRET=<paste a long random string>
```

Vercel automatically sends it as `Authorization: Bearer <secret>` on cron requests, and the endpoint rejects everything else. Customers can never receive two reminder emails for the same booking — the endpoint stamps `bookings.reminder_sent_at` after each send.

---

## Summary of Vercel Environment Variables

| Variable | Status | Notes |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | ✅ set | Stripe Dashboard → Webhooks → signing secret |
| `EMAIL_FROM` | ✅ set | `noreply@ourearsareopen.com` (Resend domain must stay verified) |
| `CRON_SECRET` | ⬜ add | Any random string — protects the reminder job |
| `TWILIO_*` | ❌ invalid | Account `AC9e947d…` is closed (status 4) — see section 3 |

Plus one Stripe-side fix: the webhook endpoint URL must point at the live domain —
`https://www.ourearsareopen.com/api/webhooks/stripe`.

---

## What's Already Working (No Action Needed)

These are live and functional right now:

- **Stripe payments** — customers can pay $10.99 for conversations (test mode works; live mode needs the webhook fix above)
- **Scheduled bookings, end to end** — book → pay or book free → listeners are notified and accept from their Appointments page → customer gets a "Join" button 15 minutes before the slot → live chat session → notes, follow-up booking, completion
- **Booking guardrails** — no overlapping bookings, no charging free conversations, no double-paying, no double-booking a listener
- **Admin bookings page** — see every booking, who is covering it, and assign or clear a listener
- **Queue system** — customers join the queue, listeners accept/decline, sessions open
- **Chat sessions** — real-time messaging between customers and listeners
- **Session management** — 15-minute timer, extend, safety disconnect, end
- **Listener dashboard** — hours tracking, 15hr/week cap, appointments, no-show marking
- **Admin reporting** — revenue, sessions, no-shows by customer, listener utilization
- **Admin campaign email** — send notices to customers/listeners/team (no-ops until Resend is configured)
- **Community rooms** — DB-backed content rooms, admin-editable
- **In-app notifications** — real-time bell, mark-read
- **Role-based access** — customer, listener, admin, super_admin all gated correctly

---

## Timeline

Chat is fully live today — both the open queue and scheduled bookings. To close the last gaps: fix the Stripe webhook URL (minutes), add `CRON_SECRET` (a minute), and reactivate or replace the Twilio account (depends on Twilio support). Voice is the only feature still waiting on a third party.

Let us know if you need help with any of these steps — happy to jump on a call to walk through it.

Best,
Development Team
