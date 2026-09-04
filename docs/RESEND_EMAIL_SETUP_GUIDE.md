# Resend Email Setup — Step-by-Step Guide (Client)

> **Goal:** Verify a **public domain** in Resend so our app can send verification emails, password resets, booking confirmations, receipts, and session summaries.
>
> **Prerequisite:** You need a domain you **own or control with DNS access**. It does **not** need a website or hosting — only the ability to add DNS records. (If you have none, see Step 0 on buying one.)

---

## Step 0 — Get a domain (only if you don't have one)

A domain is a real web address you register with a registrar. It costs roughly **US$8–12/year**.

- **Recommended registrars (cheap + easy DNS):** [Namecheap](https://namecheap.com), [Cloudflare](https://cloudflare.com), [Porkbun](https://porkbun.com), [GoDaddy](https://godaddy.com).
- **Tip:** Pick a clean, short name for your brand, e.g. `ourearsareopen.org`, `ourearsareopen.com`, or `oeao.app`.
- You do **not** need to build a website or point it anywhere — you're only using it to receive email for our platform.
- After registering, make sure you can access its **DNS / Advanced DNS** settings in that registrar's dashboard. Keep this page handy — you'll paste records there in Step 3.

> **Avoid:** Don't use a free `*.vercel.app`, `*.netlify.app`, or similar auto-assigned hostname — those cannot be verified in Resend because you don't control their DNS.

---

## Step 1 — Create a Resend account + API key

1. Go to [resend.com](https://resend.com) and **sign up**.
   - We recommend the free tier to start; it's enough for testing.
   - **Keep the email you signed up with** — Resend test sends are only deliverable to that address until a domain is verified.
2. On the left menu, go to **API Keys** → **Create API Key**.
   - **Name:** anything, e.g. `supabase-smtp`.
   - **Permissions:** **Sending access** (or Full access).
   - Copy the key that starts with `re_…`. You may not be able to see it again after closing — store it safely.
   - *(This key can later be used for the app's own transactional emails too.)*

---

## Step 2 — Add your domain to Resend

1. In Resend, go to **Domains** in the left menu.
2. Click **Add Domain**.
3. Enter the domain you own, e.g. `ourearsareopen.org`. Click **Add**.
4. Resend now shows a table of **DNS records** it needs. It typically asks for two types:
   - **SPF** (TXT record) — proves you're allowed to send for this domain.
   - **DKIM** (multiple TXT/CNAME records) — signs your emails so they pass spam filters.
   - *(Optionally DMARC, also a TXT record.)*
5. **Leave this page open** — you'll need to copy these exact values into your registrar's DNS in the next step.

> See the appendix below for a realistic example of what these records look like.

---

## Step 3 — Add the DNS records at your registrar

This step happens **at the company where you bought the domain** (Namecheap, Cloudflare, etc.), **not** in Resend or Supabase.

1. Log in to your **registrar's dashboard**.
2. Go to the domain → **DNS** / **Advanced DNS** / **Manage DNS** (labels vary by provider).
3. For **each** DNS record Resend listed:
   - Click **Add Record** (or **Add New Record**).
   - Set type: **TXT** or **CNAME** exactly as Resend shows it.
   - Paste the **Name/Host** and **Value/Content/Answer** exactly as Resend gave them (watch for leading `@`, dots, quotes).
   - Set TTL to **Auto / Default** if possible.
   - Save.
4. Repeat for every record Resend listed (usually 1 SPF + 2 DKIM + optional DMARC).

> **DNS changes take time to spread** — usually a few minutes to a few hours, sometimes up to 48h. Don't worry if it's not instant.

---

## Step 4 — Verify the domain in Resend

1. Return to Resend → **Domains**.
2. Find your domain and click **Verify** (or wait — Resend auto-checks periodically).
3. You'll see each required record flip to green **Verified** as Resend detects them.
4. Once all required records show **verified**, your domain is ready. (The status should show **Connected** / green.)

> **If verification keeps failing:** double-check you pasted the values with no extra spaces/quotes, confirm the records went to the **correct domain**, and give DNS time to propagate. DMARC is optional — only SPF/DKIM are required.

---

## Step 5 — Update the sender in Supabase

Now tell Supabase to send from your verified domain.

1. Go to [supabase.com](https://supabase.com) → open your project → **Authentication → Email → SMTP Settings**.
2. Make sure **"Enable custom SMTP" is ON**.
3. Update these fields (keep the host/port/user/password you already entered):
   - **Sender email:** `noreply@<your-verified-domain>` — e.g. `noreply@ourearsareopen.org`. **Must match the verified domain.**
   - **Sender name:** e.g. `Our Ears Are Open`.
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** your Resend API key (`re_…`)
   - **Minimum interval per user:** `45`
4. **Save.**

---

## Step 6 — Confirm it works

1. In Supabase → **Authentication → Providers → Email**, make sure **"Confirm email" is ON** (so a verification email is actually triggered).
2. On the app, register a new account with an email address **you can receive mail at**.
3. Trigger the signup → you should receive the **"Confirm your email address"** email sent from `noreply@<your-domain>`.
4. If the email arrives and the link works, you're done ✅.

---

## Interpreting errors when testing

| Error | Meaning | Fix |
|-------|---------|-----|
| `550 The ... domain is not verified` | Resend doesn't recognize the sender domain yet | Do Steps 2–4: add + verify the domain in Resend, use that exact domain in the sender |
| `550 ... not a valid sender` / `from mismatch` | Sender domain ≠ verified domain | Align sender email with the verified domain (Step 5) |
| `Auth error / 535 invalid credentials` | Wrong username/password | Username must be `resend`, password = the full Resend API key |
| Connection timeout/refused | Wrong host/port | Host `smtp.resend.com`, Port `465` |
| Email never arrives in inbox | Could be spam filter or not-yet-verified | Check spam; verify domain fully; test to your Resend sign-up address |

---

## Appendix — Example DNS records

Real values are shown in your Resend dashboard and **differ per domain/account**. This is only a shape guide:

**SPF — TXT record**
```
Name/Host:  @
Value:      v=spf1 include:amazonses.com ~all
```

**DKIM — TXT records** (2 records)
```
Name/Host:  resend._domainkey
Value:      p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCq...  ← (long key, shown in Resend)
Name/Host:  resend2._domainkey
Value:      p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDAy...  ← (long key, shown in Resend)
```

**DMARC — TXT record (optional)**
```
Name/Host:  _dmarc
Value:      v=DMARC1; p=none; rua=mailto:dmarc@ourearsareopen.org
```

> Copy the **exact** values from your Resend **Domains** page — do not copy from this example. The DKIM keys are generated uniquely for your domain.

---

## Registrar DNS locations (quick links)

- **Namecheap:** Account → Domain List → **Manage → Advanced DNS**.
- **Cloudflare:** Select site → **DNS → Records → Add record**.
- **Porkbun:** Domain List → **DNS Records**.
- **GoDaddy:** My products → domain → **Manage DNS**.

---

*If you don't already own a domain and want a recommendation, reply and we'll help you pick + buy one. Once it's verified in Resend (Step 4), we'll take it from there.*