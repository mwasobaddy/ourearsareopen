# Supabase Email Templates

All templates use Our Ears Are Open brand colors from `app/globals.css`:
- Primary gradient: `#a15a2a` → `#d1a07a`  // warm brown primary
- Background: `#f7f7f8`
- Card: `#ffffff`
- Text: `#111827` / `#4b5563`
- Footer: `#f9fafb`
- Warm accent: `#f5efe3`

## Files
- `confirm-signup.html` — Confirm signup
- `magic-link.html` — Magic link sign in
- `password-reset.html` — Reset password
- `change-password.html` — Password changed notification
- `invite-user.html` — Invite user
- `confirm-new-email.html` — Confirm new email address
- `verification-code.html` — Verification code

## How to use
1. Copy HTML content from each file.
2. In Supabase Dashboard → Authentication → Email Templates, select the template type.
3. Paste HTML into **Template content**.
4. Set subject line:
   - Confirm signup: `Confirm your email to join Our Ears Are Open`
   - Magic link: `Sign in to Our Ears Are Open`
   - Password reset: `Reset your password`
   - Invite user: `You’re invited to Our Ears Are Open`

All templates keep `{{ .ConfirmationURL }}` placeholder required by Supabase.
