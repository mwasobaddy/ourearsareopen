import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * # Email (Resend) — safe-scaffolded
 *
 * Sending is wired to the Resend API when `RESEND_API_KEY` is present.
 * Until the client provides a verified sending domain + API key, every call
 * is a graceful no-op: it returns `{ sent: false, skipped: true }` and logs a
 * one-line notice instead of throwing or breaking the surrounding flow.
 *
 * When the key is configured this sends real mail using the subject/body
 * authored by super-admins in the `email_templates` table (`/super-admin/
 * email-templates`) with `{{ placeholders }}` filled at call time.
 */

const apiKey = process.env.RESEND_API_KEY;

function getClient(): Resend | null {
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Resolve the "From" address. Prefer an explicit `EMAIL_FROM` override, then
 * the org_config support email; otherwise a placeholder on our default domain.
 */
export async function resolveFromAddress(): Promise<string> {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("org_config")
      .select("org_name, support_email")
      .eq("id", 1)
      .maybeSingle();

    if (data?.support_email) return data.support_email;

    const orgSlug = (data?.org_name ?? "ourearsareopen")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 30);
    return `noreply@${orgSlug || "ourearsareopen"}.org`;
  } catch {
    return "noreply@ourearsareopen.org";
  }
}

/** Resolve the org display name (used as the sender name if available). */
export async function resolveOrgName(): Promise<string> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("org_config")
      .select("org_name")
      .eq("id", 1)
      .maybeSingle();
    return data?.org_name || "Our Ears Are Open";
  } catch {
    return "Our Ears Are Open";
  }
}

type TemplateRow = { subject: string; body: string } | null;

/** Read a single email template by key (service-role client bypasses RLS). */
export async function getTemplate(key: string): Promise<TemplateRow> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("email_templates")
      .select("subject, body")
      .eq("key", key)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/** Replace `{{ key }}` placeholders in a template string. */
export function render(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export type SendResult = {
  sent: boolean;
  skipped?: boolean;
  error?: string | null;
  id?: string | null;
};

type SendInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

/**
 * Core send. No-ops (never throws) when Resend isn't configured.
 */
export async function sendEmail(input: SendInput): Promise<SendResult> {
  const client = getClient();

  if (!client) {
    console.log(
      `[email:skipped] RESEND_API_KEY not set — would send "${input.subject}" to ${input.to}`,
    );
    return { sent: false, skipped: true, error: null };
  }

  try {
    const from = input.from ?? (await resolveFromAddress());
    const { data, error } = await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });

    if (error) {
      console.error(`[email:error] ${error.message}`, error);
      return { sent: false, error: error.message, id: null };
    }

    return { sent: true, id: data?.id ?? null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error(`[email:error] ${message}`);
    return { sent: false, error: message, id: null };
  }
}

/** Build a simple HTML wrapper around a plain-text body (keep it minimal). */
function envelope(orgName: string, htmlBody: string): string {
  return `
<!doctype html>
<html>
  <body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;line-height:1.6;margin:0;padding:24px;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#7c3aed;padding:18px 24px;">
        <span style="color:#ffffff;font-weight:700;font-size:18px;">${orgName}</span>
      </div>
      <div style="padding:24px;">${htmlBody}</div>
    </div>
  </body>
</html>`.trim();
}

// ---------------------------------------------------------------------------
// Named helpers (each reads its template, fills placeholders, sends)
// ---------------------------------------------------------------------------

const DEFAULT_VARS: Record<string, string> = { org_name: "Our Ears Are Open" };

async function loadOrg() {
  const [orgName, from] = await Promise.all([
    resolveOrgName(),
    resolveFromAddress(),
  ]);
  return { orgName, from, orgVars: { org_name: orgName } as Record<string, string> };
}

/** Welcome — sent after account creation. */
export async function sendWelcomeEmail(input: {
  to: string;
  first_name: string;
}): Promise<SendResult> {
  const template = await getTemplate("welcome");
  const { from, orgName, orgVars } = await loadOrg();
  const vars: Record<string, string> = {
    ...DEFAULT_VARS,
    ...orgVars,
    first_name: input.first_name,
  };
  const subject = template ? render(template.subject, vars) : `Welcome to ${vars.org_name}`;
  const body = template
    ? render(template.body, vars)
    : `Hi ${input.first_name}, thanks for joining ${vars.org_name}.`;
  return sendEmail({
    to: input.to,
    from,
    subject,
    html: envelope(orgName, `<p>${body.replace(/\n/g, "</p><p>")}</p>`),
  });
}

/** Booking confirmation — sent when a paid booking is confirmed (webhook). */
export async function sendBookingConfirmationEmail(input: {
  to: string;
  first_name: string;
  type: string;
  slot_start: string | null;
  listener_name: string | null;
}): Promise<SendResult> {
  const template = await getTemplate("booking_confirm");
  const { from, orgName, orgVars } = await loadOrg();
  const slot = input.slot_start
    ? new Date(input.slot_start).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "your scheduled time";
  const vars: Record<string, string> = {
    ...DEFAULT_VARS,
    ...orgVars,
    first_name: input.first_name,
    type: input.type,
    slot_start: slot,
    listener_name: input.listener_name ?? "your listener",
  };
  const subject = template
    ? render(template.subject, vars)
    : `Your ${input.type} conversation is booked`;
  const body = template
    ? render(template.body, vars)
    : `Hi ${input.first_name}, your ${input.type} conversation is confirmed for ${slot} with ${vars.listener_name}.`;
  return sendEmail({
    to: input.to,
    from,
    subject,
    html: envelope(orgName, `<p>${body.replace(/\n/g, "</p><p>")}</p>`),
  });
}

/** Receipt — sent after any successful payment. */
export async function sendSessionReceiptEmail(input: {
  to: string;
  first_name: string;
  amount: string;
}): Promise<SendResult> {
  const template = await getTemplate("session_receipt");
  const { from, orgName, orgVars } = await loadOrg();
  const vars: Record<string, string> = {
    ...DEFAULT_VARS,
    ...orgVars,
    first_name: input.first_name,
    amount: input.amount,
  };
  const subject = template
    ? render(template.subject, vars)
    : `Your payment receipt`;
  const body = template
    ? render(template.body, vars)
    : `Hi ${input.first_name}, here is your receipt for ${input.amount}.`;
  return sendEmail({
    to: input.to,
    from,
    subject,
    html: envelope(orgName, `<p>${body.replace(/\n/g, "</p><p>")}</p>`),
  });
}

/** Post-session synopsis — sent after a completed session. */
export async function sendSessionSynopsisEmail(input: {
  to: string;
  first_name: string;
  synopsis: string | null;
}): Promise<SendResult> {
  const template = await getTemplate("session_synopsis");
  const { from, orgName, orgVars } = await loadOrg();
  const note = input.synopsis?.trim() || "Your listener has shared a summary.";
  const vars: Record<string, string> = {
    ...DEFAULT_VARS,
    ...orgVars,
    first_name: input.first_name,
    synopsis: note,
  };
  const subject = template
    ? render(template.subject, vars)
    : `Here is a summary of your session`;
  const body = template
    ? render(template.body, vars)
    : `Hi ${input.first_name}, thanks for talking with us today. ${note}`;
  return sendEmail({
    to: input.to,
    from,
    subject,
    html: envelope(
      orgName,
      `<p>${body.replace(/\n/g, "</p><p>")}</p><hr><p style="color:#6b7280;font-style:italic;">${note}</p>`,
    ),
  });
}

/** Booking reminder — sent ahead of a scheduled session. */
export async function sendBookingReminderEmail(input: {
  to: string;
  first_name: string;
  slot_start: string | null;
}): Promise<SendResult> {
  const template = await getTemplate("booking_reminder");
  const { from, orgName, orgVars } = await loadOrg();
  const slot = input.slot_start
    ? new Date(input.slot_start).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "your scheduled time";
  const vars: Record<string, string> = { ...DEFAULT_VARS, ...orgVars, first_name: input.first_name, slot_start: slot };
  const subject = template
    ? render(template.subject, vars)
    : `Reminder: your conversation`;
  const body = template
    ? render(template.body, vars)
    : `Hi ${input.first_name}, a friendly reminder about your conversation on ${slot}.`;
  return sendEmail({
    to: input.to,
    from,
    subject,
    html: envelope(orgName, `<p>${body.replace(/\n/g, "</p><p>")}</p>`),
  });
}

/**
 * Follow-up payment link — sent to the consumer when a listener books a paid
 * follow-up in-session. Carries ONLY a payment link (never exposes any
 * payment details to the listener). Safe no-op when email isn't configured.
 */
export async function sendFollowUpPaymentEmail(input: {
  to: string;
  first_name: string;
  slot_start: string | null;
  payment_url: string;
}): Promise<SendResult> {
  const { from, orgName, orgVars } = await loadOrg();
  const slot = input.slot_start
    ? new Date(input.slot_start).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "your scheduled follow-up";
  const vars: Record<string, string> = {
    ...DEFAULT_VARS,
    ...orgVars,
    first_name: input.first_name,
    slot_start: slot,
  };
  const subject = `Complete your follow-up booking`;
  const body = `Hi ${input.first_name}, your listener has scheduled a paid follow-up for ${slot}. Please complete payment here to confirm your slot: ${input.payment_url}`;
  return sendEmail({
    to: input.to,
    from,
    subject,
    html: envelope(
      orgName,
      `<p>${body.replace(/\n/g, "</p><p>")}</p><p><a href="${input.payment_url}" style="display:inline-block;padding:10px 18px;background:#6d28d9;color:#fff;border-radius:8px;text-decoration:none;">Complete payment</a></p>`,
    ),
  });
}

/**
 * Generic campaign/notice — used by the admin send-email surface to reach a
 * segment of team members and consumers. Supports `{{ first_name }}`
 * placeholders. Safe no-op when Resend isn't configured.
 */
export async function sendCampaignEmail(input: {
  to: string;
  subject: string;
  body: string;
  first_name?: string | null;
}): Promise<SendResult> {
  const { from, orgName, orgVars } = await loadOrg();
  const vars: Record<string, string> = {
    ...DEFAULT_VARS,
    ...orgVars,
    first_name: input.first_name ?? "there",
  };
  const resolvedSubject = render(input.subject, vars);
  const resolvedBody = render(input.body, vars);
  return sendEmail({
    to: input.to,
    from,
    subject: resolvedSubject,
    html: envelope(
      orgName,
      `<p>${resolvedBody.replace(/\n/g, "</p><p>")}</p>`,
    ),
  });
}
