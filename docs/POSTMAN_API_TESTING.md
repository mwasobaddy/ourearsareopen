# API Routes for Postman Testing

Full reference of every Next.js API route for the **Our Ears Are Open** platform, ready to run from Postman.

## Base URLs

| Environment | URL |
|---|---|
| Production (Vercel) | `https://ourearsareopen.vercel.app` |
| Local dev | `http://localhost:3000` |

> Note: Instance-specific Vercel URLs like `https://ourearsareopen-pwjopjngx-big-obadiahs-projects.vercel.app` also work if the custom domain isn't attached yet. Use any URL that returns 200 on `/`.

## Authentication

All endpoints (except the Stripe webhook) require a logged-in Supabase session.

### How to authenticate in Postman

Use Postman's cookie jar + a login flow, or set the `Authorization: Bearer <access_token>` header:

1. **Option A (cookie):** Open the app in a browser, log in, copy the `sb-<ref>-auth-token` cookies, and paste them into *Postman → Cookies → Manage Domain Cookies* for your base URL.
2. **Option B (Bearer token):** Generate an access token and add to every request:
   - Header: `Authorization: Bearer <access_token>`
   - Get a token from `/login` or the Supabase auth API.

### Role legend

| Role | Access |
|---|---|
| `customer` | Consumer account |
| `listener` | Trained listener |
| `admin` | Admin dashboard |
| `super_admin` | Full platform control |
| `public` | No auth needed |

---

## 1. Sessions

### Open a live session
- **Method:** `POST`
- **Path:** `/api/session/open`
- **Auth:** customer or listener (participant)
- **Body (JSON):**
  ```json
  { "queue_entry_id": "<uuid>", "mode": "chat" }
  // OR
  { "booking_id": "<uuid>", "mode": "phone" }
  ```
- **Responses:** `200` session object · `400` invalid · `403` forbidden · `404` not found · `409` at 15hr/week cap · `500` insert failed

### End a session
- **Method:** `POST`
- **Path:** `/api/session/<session_id>/end`
- **Auth:** customer or listener (participant)
- **Body (JSON):**
  ```json
  { "reason": "Safety disconnect — consumer escalated." }
  ```
- **Responses:** `200` session · `400` invalid · `403` forbidden · `404` not found · `409` cannot end (already ended/completed/pending)

### Complete a session
- **Method:** `POST`
- **Path:** `/api/session/<session_id>/complete`
- **Auth:** customer or listener (participant)
- **Body:** none
- **Responses:** `200` `{ session, document }` · `403` forbidden · `404` not found · `500` error

### Save session notes
- **Method:** `PUT`
- **Path:** `/api/session/<session_id>/notes`
- **Auth:** `listener` (assigned only)
- **Body (JSON):**
  ```json
  { "notes": "Consumer shared... listener recommended..." }
  ```
- **Responses:** `200` `{ ok: true, notes }` · `400` invalid · `403` not assigned listener · `404` not found

---

## 2. Bookings

### Book a conversation (create)
- **Method:** `POST`
- **Path:** `/api/bookings`
- **Auth:** signed-in customer
- **Body (JSON):**
  ```json
  {
    "type": "chat",
    "payment_option": "free",
    "concern": "I have been feeling anxious about my job change.",
    "preferences": { "gender": "no-preference", "language": "english" },
    "slot_start": "2026-10-09T09:00:00.000Z"
  }
  ```
  - `type`: `chat` | `phone` (`phone` requires the `scheduled_phone` feature flag)
  - `payment_option`: `paid` (stays `pending` until Stripe confirms) | `free` (confirmed immediately)
  - `slot_start`: ISO 8601 **with offset**, at least 30 minutes in the future
- **Responses:** `201` `{ booking }` · `400` missing/invalid concern, past slot, under 30-min lead · `401` unauthenticated · `409` overlapping booking · `409` feature disabled
- **Side effects:** free bookings email a confirmation; confirmed bookings notify every active listener.

### List open booking requests (listener)
- **Method:** `GET`
- **Path:** `/api/bookings/open`
- **Auth:** listener only
- **Returns:** `{ requests: [{ id, type, concern, slot_start, payment_option, customer }] }` — confirmed, unassigned, upcoming bookings.
- **Responses:** `200` · `401` unauthenticated · `403` not a listener

### Accept a booking request (listener)
- **Method:** `POST`
- **Path:** `/api/bookings/<booking_id>/accept`
- **Auth:** listener only (assigns the caller)
- **Responses:** `200` `{ ok: true }` · `401` · `403` not a listener/inactive · `404` unknown booking · `409` already taken, unpaid, or 15 hr/week cap reached
- **Side effects:** assigns `listener_id` + `assigned_at`, claims a matching availability slot, notifies the customer.

### Assign / clear a listener (admin)
- **Method:** `PATCH`
- **Path:** `/api/admin/bookings/assign`
- **Auth:** admin or super_admin
- **Body (JSON):**
  ```json
  { "bookingId": "<uuid>", "listenerId": "<uuid or null>" }
  ```
- **Responses:** `200` `{ ok: true, listener_id }` · `400` `bookingId` missing · `401` · `403` · `404` unknown booking · `409` already taken / unpaid / listener double-booked / not an active listener

### Place a phone call (listener)
- **Method:** `POST`
- **Path:** `/api/twilio/call`
- **Auth:** the session's assigned listener, `phone` mode only
- **Body (JSON):** `{ "session_id": "<uuid>" }`
- **Responses:** `200` `{ ok, call_sid, status, dialing }` · `401` · `403` not the assigned listener · `404` unknown session · `409` not a phone session / already finished / missing phone number · `502` call failed · `503` Twilio not configured or account inactive
- **Requires:** `profiles.phone` on both the listener and the consumer, plus a live Twilio account.

### Hang up a phone call (listener)
- **Method:** `DELETE`
- **Path:** `/api/twilio/call`
- **Auth:** the session's assigned listener
- **Body (JSON):** `{ "session_id": "<uuid>" }`
- **Responses:** `200` `{ ok: true, status }` · `401` · `403` · `404` · `409` no call in progress · `502` · `503`

### Follow-up booking — list available slots
- **Method:** `GET`
- **Path:** `/api/bookings/follow-up?session_id=<uuid>`
- **Auth:** listener or admin
- **Responses:** `200` `{ slots: [...] }` · `403` forbidden · `404` no listener

### Follow-up booking — create
- **Method:** `POST`
- **Path:** `/api/bookings/follow-up`
- **Auth:** listener or admin
- **Body (JSON):**
  ```json
  {
    "session_id": "<uuid>",
    "slot_id": "<uuid>",
    "is_paid": false,
    "concern": "Follow-up booked in-session"
  }
  ```
- **Responses:** `200` booking · `400` bad request · `403` forbidden · `404` missing · `409` slot unavailable/past · `500` insert failed

### Reschedule a booking
- **Method:** `PATCH`
- **Path:** `/api/bookings/<booking_id>`
- **Auth:** `customer` (owner)
- **Body (JSON):**
  ```json
  {
    "slot_start": "2026-10-01T14:00:00.000Z",
    "slot_end": "2026-10-01T14:15:00.000Z"
  }
  ```
- **Responses:** `200` booking · `400` bad request · `403` forbidden · `404` not found · `409` can't reschedule / slot taken / past

### Reschedule — list options
- **Method:** `GET`
- **Path:** `/api/bookings/<booking_id>/reschedule-options`
- **Auth:** `customer` (owner)
- **Responses:** `200` `{ slots: [...] }` · `403` forbidden · `404` not found · `409` past appointment

### Mark a booking no-show
- **Method:** `POST`
- **Path:** `/api/bookings/<booking_id>/no-show`
- **Auth:** `listener` (assigned) or admin
- **Body:** none
- **Responses:** `200` `{ ok: true }` · `403` forbidden · `404` not found · `409` not confirmed/pending · `500` error

---

## 3. Payments (Stripe)

### Create a PaymentIntent
- **Method:** `POST`
- **Path:** `/api/stripe/payment-intent`
- **Auth:** any signed-in user
- **Body (JSON):**
  ```json
  { "type": "donation", "amount_cents": 1000, "currency": "usd" }
  ```
  ```json
  { "type": "queue" }
  ```
  ```json
  { "type": "booking", "bookings_id": "<uuid>" }
  ```
- **Responses:** `200` `{ clientSecret, paymentIntentId, paymentId, amountCents, currency }` · `400` invalid/range · `401` unauthenticated · `403` feature-flag disabled · `503` Stripe not configured

### Stripe webhook
- **Method:** `POST`
- **Path:** `/api/webhooks/stripe`
- **Auth:** none (verified by `stripe-signature` header)
- **Header:** `stripe-signature: <sig>` (auto-set by Stripe; Postman needs it from Stripe CLI / dashboard test event)
- **Responses:** `200` `{ received: true }` · `400` bad signature/missing secret
- **Events handled:** `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

---

## 4. Email

### Send booking reminders (cron)
- **Method:** `GET`
- **Path:** `/api/email/reminders?at=<iso8601>&hours=24`
- **Auth:** `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set in the environment. Vercel Cron sends this automatically (see `vercel.json`).
- **Behaviour:** emails one reminder to every confirmed booking with a listener assigned whose slot starts inside the lookahead window, then stamps `bookings.reminder_sent_at` so repeat runs never double-send. Bookings in the past or still awaiting a listener are skipped.
- **Query params:** `at` optional (reference time, defaults to now) · `hours` optional (lookahead window, default `24`).
- **Responses:** `200` `{ ok: true, sent, skipped, at }` · `400` invalid `at` · `401` missing/invalid cron secret

### Send welcome email
- **Method:** `POST`
- **Path:** `/api/email/welcome`
- **Auth:** signed-in user (targets own profile)
- **Body (JSON):**
  ```json
  { "userId": "<uuid>" }
  ```
- **Responses:** `200` `{ sent: true }` · `401` unauthenticated · `403` not own email · `404` profile not found

---

## 5. Open Queue

### Join the queue
- **Method:** `POST`
- **Path:** `/api/queue/join`
- **Auth:** signed-in customer
- **Body (JSON):**
  ```json
  { "payment_id": "<uuid of succeeded queue payment>" }
  ```
- **Responses:** `200` entry · `400` not a queue payment / paid wrong · `402` not paid yet · `403` flag disabled · `404` payment not found · `500` insert failed

### List wait pool (listener)
- **Method:** `GET`
- **Path:** `/api/queue/pool`
- **Auth:** `listener`
- **Responses:** `200` `{ pool: [...] }` · `403` not listener · `500` error

### Accept a waiting customer (listener)
- **Method:** `POST`
- **Path:** `/api/queue/accept`
- **Auth:** `listener`
- **Body (JSON):**
  ```json
  { "queue_entry_id": "<uuid>" }
  ```
- **Responses:** `200` `{ ok, queue_entry_id }` · `403` not listener · `409` not waiting / at 15hr cap

### Leave the queue
- **Method:** `POST`
- **Path:** `/api/queue/leave`
- **Auth:** signed-in customer
- **Body:** none
- **Responses:** `200` `{ ok, alreadyLeft? }`

### Toggle queue availability (listener)
- **Method:** `GET` — returns `{ open_queue_enabled }`
- **Method:** `POST` — toggles availability, auto-assigns FIFO customer if enabling
- **Path:** `/api/queue/toggle`
- **Auth:** `listener`
- **Body:** none
- **Responses:** `200` `{ open_queue_enabled, assignedEntry? }` · `403` not listener · `409` at 15hr cap

### Decline a customer (listener)
- **Method:** `POST`
- **Path:** `/api/queue/decline`
- **Auth:** `listener`
- **Body (JSON):**
  ```json
  { "queue_entry_id": "<uuid>", "reason": "Cannot support this concern today." }
  ```
- **Responses:** `200` `{ ok, queue_entry_id }` · `400` invalid · `403` not listener · `409` not waiting

### View a customer in your care (listener)
- **Method:** `GET`
- **Path:** `/api/queue/customer/<customer_user_id>`
- **Auth:** `listener`
- **Responses:** `200` `{ customer }` · `403` not in your care · `404` not found

---

## 6. Admin

### Create a listener account
- **Method:** `POST`
- **Path:** `/api/admin/listeners`
- **Auth:** admin/super_admin
- **Body (JSON):**
  ```json
  { "full_name": "Jane Doe", "email": "jane@example.com" }
  ```
- **Responses:** `201` listener · `400` invalid / create failed · `401` unauthorized · `500` profile save failed

### Toggle a profile active/inactive
- **Method:** `PATCH`
- **Path:** `/api/admin/profiles/<profile_id>/status`
- **Auth:** admin/super_admin
- **Body (JSON):**
  ```json
  { "is_active": false }
  ```
- **Responses:** `200` `{ profile }` · `400` invalid · `401` unauthorized · `500` error

### Send campaign email
- **Method:** `POST`
- **Path:** `/api/admin/send-email`
- **Auth:** admin/super_admin
- **Body (JSON):**
  ```json
  {
    "segment": "customers",
    "subject": "New community room",
    "body": "We added a new support room. Come say hi."
  }
  ```
  ```json
  { "segment": "user", "userId": "<uuid>", "subject": "...", "body": "..." }
  ```
- **Responses:** `200` `{ ok, total, delivered, skipped, noEmail }` · `400` invalid · `401` unauthorized · `404` user not found

### List campaign segments
- **Method:** `GET`
- **Path:** `/api/admin/email-segments`
- **Auth:** admin/super_admin
- **Responses:** `200` `{ segments: [{ id, label, count }] }`

### Read a customer's assigned listener
- **Method:** `GET`
- **Path:** `/api/admin/assigned-listener?userId=<uuid>`
- **Auth:** admin/super_admin
- **Responses:** `200` `{ customer, assignedListener }` · `400` missing userId · `401` unauthorized · `404` not found

### Set / clear a customer's assigned listener
- **Method:** `PATCH`
- **Path:** `/api/admin/assigned-listener`
- **Auth:** admin/super_admin
- **Body (JSON):**
  ```json
  { "userId": "<uuid>", "listenerId": "<uuid>" }
  // listenerId: null clears the assignment
  ```
- **Responses:** `200` `{ customer }` · `400` invalid / not a listener / inactive · `404` not found · `500` error

### Create support/refund ticket
- **Method:** `POST`
- **Path:** `/api/admin/support`
- **Auth:** admin/super_admin
- **Body (JSON):**
  ```json
  {
    "kind": "refund",
    "subject": "Refund request",
    "description": "Customer double-charged.",
    "user_id": "<uuid>",
    "payment_id": "<uuid>",
    "internal_notes": ""
  }
  ```
- **Responses:** `201` ticket · `400` invalid · `401` unauthorized · `500` insert failed

### Resolve / reopen / add note to a ticket
- **Method:** `PATCH`
- **Path:** `/api/admin/support/<ticket_id>`
- **Auth:** admin/super_admin
- **Body (JSON):**
  ```json
  { "action": "resolve", "internal_notes": "Refund issued." }
  // actions: resolve | reopen | note
  ```
- **Responses:** `200` ticket · `400` invalid · `401` unauthorized · `500` error

---

## 7. Content Management

### Crisis resources
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| `GET` | `/api/admin/content/crisis` | admin | list all (skills) |
| `POST` | `/api/admin/content/crisis` | admin | `{ name, description?, phone?, availability?, is_primary?, is_active?, sort_order? }` |
| `PATCH` | `/api/admin/content/crisis/<id>` | admin | partial update |
| `DELETE` | `/api/admin/content/crisis/<id>` | admin | delete |

### Community rooms
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| `GET` | `/api/admin/content/rooms` | admin | list all |
| `POST` | `/api/admin/content/rooms` | admin | `{ slug, title, description?, icon?, sort_order?, is_active? }` |
| `PATCH` | `/api/admin/content/rooms/<id>` | admin | partial update |
| `DELETE` | `/api/admin/content/rooms/<id>` | admin | delete |

---

## 8. Notifications

### Mark notifications as read
- **Method:** `POST`
- **Path:** `/api/notifications/read`
- **Auth:** signed-in user (own notifications)
- **Body (JSON):**
  ```json
  { "notificationIds": ["<uuid>", "<uuid>"] }
  // OR
  { "markAll": true }
  ```
- **Responses:** `200` `{ ok: true }` · `400` invalid · `401` unauthorized · `500` error

---

## 9. Availability

### Get / save listener weekly availability
| Method | Path | Auth | Body |
|---|---|---|---|
| `GET` | `/api/availability` | `listener` | — returns `{ availability }` |
| `PUT` | `/api/availability` | `listener` | `{ "availability": { "monday": ["09:00-12:00"], "tuesday": ["14:00-18:00"] } }` |

- **Responses:** `200` · `400` invalid · `401` unauthorized · `403` not listener

---

## 10. Super Admin

### Update org config
- **Method:** `PATCH`
- **Path:** `/api/super-admin/org-config`
- **Auth:** `super_admin`
- **Body (JSON):**
  ```json
  {
    "org_name": "Our Ears Are Open",
    "logo_url": "",
    "support_email": "support@ourearsareopen.com",
    "timezone": "America/New_York",
    "crisis_links": [{ "label": "988", "url": "tel:988" }]
  }
  ```
- **Responses:** `200` `{ ok }` · `400` invalid · `401` unauthorized · `500` error

### Update an email template
- **Method:** `PATCH`
- **Path:** `/api/super-admin/email-templates/<key>`
- **Auth:** `super_admin`
- **Body (JSON):**
  ```json
  { "subject": "Confirm your email", "body": "<html>...</html>", "description": "" }
  ```
- **Responses:** `200` `{ template }` · `400` invalid · `401` unauthorized · `500` error

### Toggle a user's status
- **Method:** `PATCH`
- **Path:** `/api/super-admin/users/<user_id>/status`
- **Auth:** `super_admin`
- **Body (JSON):**
  ```json
  { "is_active": false }
  ```
- **Responses:** `200` `{ ok }` · `400` invalid / last super admin · `401` unauthorized · `404` not found · `500` error

### Change a user's role
- **Method:** `PATCH`
- **Path:** `/api/super-admin/users/<user_id>/role`
- **Auth:** `super_admin`
- **Body (JSON):**
  ```json
  { "role": "listener" }
  ```
- **Roles:** `customer` | `listener` | `admin` | `super_admin`
- **Responses:** `200` `{ ok }` · `400` invalid / last super admin / self · `401` unauthorized · `404` not found · `500` error

### Update feature flags
- **Method:** `PUT`
- **Path:** `/api/super-admin/feature-flags`
- **Auth:** `super_admin`
- **Body (JSON):**
  ```json
  {
    "open_queue": { "enabled": true, "description": "Open chat queue" },
    "donations": { "enabled": true },
    "free_booking": { "enabled": true },
    "scheduled_phone": { "enabled": false }
  }
  ```
- **Responses:** `200` `{ ok, changed }` · `400` invalid · `401` unauthorized · `500` error

---

## Postman Setup Checklist

1. Create a `OurEarsAreOpen` collection.
2. Add variables:
   - `baseUrl` = `https://ourearsareopen.vercel.app` (or `http://localhost:3000`)
   - `sessionToken` = pasted access token
3. Create a reusable Header (before-request script):
   ```js
   pm.request.headers.upsert({ key: "Authorization", value: "Bearer " + pm.environment.get("sessionToken") });
   ```
4. Group folders by module: Sessions, Bookings, Payments, Email, Queue, Admin, Content, Notifications, Availability, Super Admin.
5. For the Stripe webhook, use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) or a dashboard test event — the `stripe-signature` header can't be forged manually.

## UUID placeholders

When testing, replace `<uuid>` values with real IDs from the database, e.g.:

- Get a session ID: open the app and start a session, or query `sessions` in Supabase.
- Get a booking ID: book a session in the app, or query `bookings`.
- Get a payment ID: create a payment intent, then query `payments`.
- Get a queue entry ID: join the queue, then query `queue_entries`.