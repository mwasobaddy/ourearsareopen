import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingReminderEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_IN_MS = 60_000;

/**
 * GET /api/email/reminders?at=<iso> — cron entry point for booking reminders.
 *
 * Scan *confirmed* bookings whose slot_start falls inside two windows relative
 * to the reference time `at` (default now):
 *   - the "24h reminder" window  (slot ~24h out)
 *   - the "15-minute reminder" window (slot ~15 min out)
 *
 * No-ops until RESEND_API_KEY is set. Intended to be triggered by a scheduler
 * (Vercel Cron, Supabase pg_cron, Upstash, etc.).
 */
export async function GET(req: NextRequest) {
  const at = new Date(
    req.nextUrl.searchParams.get("at") ?? new Date().toISOString(),
  );
  const now = at.getTime();

  const admin = createAdminClient();
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, slot_start, type, user_id, listener_id")
    .eq("status", "confirmed")
    .not("slot_start", "is", null);

  if (!bookings) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0 });
  }

  let sent = 0;
  let skipped = 0;

  for (const b of bookings) {
    const slot = Date.parse(b.slot_start as string);
    if (Number.isNaN(slot)) continue;

    const diffMin = (slot - now) / MIN_IN_MS;

    // 15-minute reminder window: 10–20 minutes out.
    const is15m = diffMin >= 10 && diffMin <= 20;
    // 24h reminder window: 23h–25h out.
    const is24h = diffMin >= 60 * 23 && diffMin <= 60 * 25;

    if (!is15m && !is24h) continue;

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", b.user_id)
      .maybeSingle();
    if (!profile?.email) {
      skipped++;
      continue;
    }

    const firstName = (profile.full_name ?? "").trim().split(/\s+/)[0] || "there";
    await sendBookingReminderEmail({
      to: profile.email,
      first_name: firstName,
      slot_start: b.slot_start as string,
    });
    sent++;
  }

  // NOTE: for production idempotency, add a `reminder_sent_at` column to
  // `bookings` and skip rows already sent, so a cron re-run doesn't double-send.
  return NextResponse.json({ ok: true, sent, skipped, at: at.toISOString() });
}