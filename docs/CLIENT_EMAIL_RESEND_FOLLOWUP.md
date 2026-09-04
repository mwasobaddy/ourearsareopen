# Client Email — Small Follow-Up on Resend (Email Setup)

**Subject:** Small follow-up to finish email setup (Resend needs a public domain)

---

Dear [Client Name],

Quick, friendly follow-up on the email setup. We got an API key configured and pointed Supabase at Resend, but when we tested sending a verification email we hit a snag — and it's an easy, one-time fix on your side.

**What happened:** Resend requires the **domain** in the "from" address to be *verified* before it will send mail. The address we were using ends in `vercel.app`, and because that's an auto-assigned hostname (not a domain you control), Resend refuses to send from it (error: *"the domain is not verified"*).

**What we need from you:** A **public domain you own/control** (DNS access) so we can verify it in Resend. It doesn't need a website or hosting — it just needs to be a real domain (e.g. `ourearsareopen.org` or `.com`) where you can add a couple of DNS records. A domain costs only a few dollars a year if you don't have one.

**Why it matters:** When you are ready to launch, the app sends verification links, password reset emails, booking confirmations, receipts, and post-session summaries. All of these need to come from a verified domain, or mail simply won't be delivered.

We've attached a **step-by-step guide** (see the linked document) that walks you through, end to end:

1. Buying / choosing a domain (if you don't have one).
2. Adding the domain to **Resend** and pasting the DNS records it gives you.
3. Pointing the DNS records at your provider.
4. Verifying the domain in Resend.
5. Updating the sender address in Supabase to the verified domain.
6. Confirming it works.

Once you've done that (or sent us the domain name), we'll take it from there. Nothing else is blocked — this is the last piece for email.

If you already own a domain, let us know which registrar (e.g. Namecheap, GoDaddy, Cloudflare, Porkbun) so we can give you exact, copy-paste DNS steps for it.

Thanks, and let us know if you have any questions!

Best,
Your development team