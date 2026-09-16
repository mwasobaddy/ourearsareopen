# Client Response — Credentials Received + Twilio Questions Answered

**To:** Client
**From:** Development Team
**Subject:** Re: Credentials + Twilio free trial questions

---

Hi,

Credentials received — thank you. Here's the status and answers to your Twilio questions.

---

## What's Done

All four environment variables have been added to the deployment config:

- ✅ `STRIPE_WEBHOOK_SECRET` — set
- ✅ `RESEND_API_KEY` — already configured
- ✅ `TWILIO_API_KEY_SID` — set
- ✅ `TWILIO_API_KEY_SECRET` — set

**One remaining Stripe step on your end:** In Stripe Dashboard → Developers → Webhooks, make sure the webhook URL is:
```
https://www.ourearsareopen.com/api/webhooks/stripe
```
(Not just the root domain — it must include `/api/webhooks/stripe`.) Once that's correct, payments will start confirming automatically.

**Resend:** Please confirm which domain you verified in Resend (e.g. `ourearsareopen.org` or something else) so we can set the exact `EMAIL_FROM` address. Right now it's set to `noreply@ourearsareopen.org`.

---

## Twilio Free Trial — Your Questions Answered

### Question 1: Can we operate with free trial credits until the site is active?

**Short answer: Yes for SMS. No for voice calls to arbitrary numbers.**

Here's what works and what doesn't on a free trial:

| Feature | Free Trial | Why |
|---|---|---|
| **SMS to verified numbers** | ✅ Works | You can verify up to ~100 numbers |
| **SMS to unverified numbers** | ❌ Blocked | Trial can only text verified numbers |
| **Voice calls to verified numbers** | ✅ Works | Same verification requirement |
| **Voice calls to unverified numbers** | ❌ Blocked | Trial adds a "trial" audio message and blocks unverified |
| **Receiving calls/SMS** | ✅ Works | Inbound always works |
| **Credits** | ~$15 free | Enough for testing + early low-volume use |

**For your specific use case:** The voice session feature connects a customer to a listener via phone. On a free trial, this only works if the customer's phone number is manually verified in Twilio first. That's not practical for real users.

**Recommendation:** The free trial is fine for:
- Internal testing
- SMS reminders (to your own verified numbers)
- Early low-volume use with manually verified numbers

Once you're ready to go live with real users, you'll need to upgrade to a paid Twilio account. At that point, voice calls work to any number with no restrictions.

### Question 2: If not, what alternatives do we have?

Since you **can** use the free trial for testing and early launch, alternatives aren't needed yet. But if Twilio's paid plan doesn't fit your launch timeline, here are options:

| Service | Voice | SMS | Free Tier | Notes |
|---|---|---|---|---|
| **Vonage (Nexmo)** | ✅ | ✅ | $2 credit | Good alternative, similar API |
| **MessageBird** | ✅ | ✅ | €2 credit | European-based, good for international |
| **Bandwidth** | ✅ | ✅ | Trial available | US-focused, carrier-grade |

**Our recommendation:** Stick with Twilio. The free trial covers testing and early use. When you're ready to go live, upgrade to a paid account — it's a few clicks and billing starts automatically. No need to switch providers.

---

## What Happens Next

Once the Stripe webhook URL is corrected and Resend domain is confirmed:

1. **Paid bookings will confirm automatically** (webhook fires → booking status updates → receipt email sends)
2. **Emails will deliver** (welcome, booking confirmation, receipt, session synopsis, reminders, admin campaigns)
3. **Voice calls will work** (to verified numbers during trial; to all numbers after paid upgrade)
4. **SMS reminders will work** (to verified numbers during trial)

The platform is functionally complete. These configuration items are the last step before full launch.

Let us know if you need help with the Stripe webhook URL update or have questions about the Twilio upgrade path.

Best,
Development Team
