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

## 3. Twilio API Credentials (Voice Calls & SMS Will Not Work Without This)

**Problem:** Voice sessions and SMS reminders are fully built but need Twilio API credentials. We have the main account SID and phone number (`+18888744429`), but we're missing the **API Key SID** and **API Key Secret** needed to make outbound calls and send SMS.

**What to do:**

1. Go to **Twilio Console → API Keys → Create API Key**.
2. Give it a name (e.g. "ourearsareopen-prod") and copy the **SID** and **Secret**.
3. In **Vercel → ourearsareopen → Settings → Environment Variables**, add:
   ```
   TWILIO_API_KEY_SID=SK_your_key_sid_here
   TWILIO_API_KEY_SECRET=your_key_secret_here
   ```
4. If you haven't already, upgrade to a **paid Twilio account** and ensure the phone number `+18888744429` has **SMS capability** enabled (for the 15-minute reminder SMS).
5. Redeploy.

**What breaks without it:** No voice calls from the session room. No 15-minute SMS reminders. The phone conversation feature is fully built but cannot dial out.

---

## Summary of Vercel Environment Variables Needed

| Variable | Value | Source |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Webhooks → Signing secret |
| `EMAIL_FROM` | `noreply@yourdomain.com` | After Resend domain is verified |
| `TWILIO_API_KEY_SID` | `SK_...` | Twilio Console → API Keys |
| `TWILIO_API_KEY_SECRET` | `...` | Twilio Console → API Keys (shown once) |

All four should be added as **Production** environment variables in Vercel, then the app should be redeployed.

---

## What's Already Working (No Action Needed)

These are live and functional right now:

- **Stripe payments** — customers can pay $10.99 for conversations (test mode works; live mode needs the webhook fix above)
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

Once you provide the four environment variables above and fix the Stripe webhook URL, we can go fully live. The Resend domain verification takes a few minutes; Stripe and Twilio are instant once the keys are in Vercel.

Let us know if you need help with any of these steps — happy to jump on a call to walk through it.

Best,
Development Team
