import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingReminderEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_IN_MS = 60_000;
const DEFAULT_WINDOW_HOURS = 24;

/**
 * GET /api/email/reminders — booking reminders for the scheduled path.
 *
 * Every *confirmed* booking with a listener assigned whose slot falls inside
 * the lookahead window (`?hours=`, default 24) and that hasn't been reminded
 * yet gets one email, then `reminder_sent_at` is stamped so re-running the job
 * (hourly cron, manual retry, deploy-time probe) can't double-send.
 *
 * Called by Vercel Cron (see `vercel.json`). When `CRON_SECRET` is configured,
 * Vercel sends it as `Authorization: Bearer <secret>` and the request is
 * rejected without it. No-ops until RESEND_API_KEY is set.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization") ?? "";
    if (header !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const atParam = req.nextUrl.searchParams.get("at");
  const hoursParam = Number(req.nextUrl.searchParams.get("hours"));
  const windowHours =
    Number.isFinite(hoursParam) && hoursParam > 0 ? hoursParam : DEFAULT_WINDOW_HOURS;

  const now = atParam ? new Date(atParam) : new Date();
  if (Number.isNaN(now.getTime())) {
    return NextResponse.json({ error: "Invalid `at` timestamp." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, slot_start, type, user_id, listener_id, reminder_sent_at")
    .eq("status", "confirmed")
    .not("slot_start", "is", null)
    .is("reminder_sent_at", null)
    .lte("slot_start", new Date(now.getTime() + windowHours * 60 * MIN_IN_MS).toISOString())
    .order("slot_start", { ascending: true })
    .limit(200);

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      skipped: 0,
      at: now.toISOString(),
    });
  }

  let sent = 0;
  let skipped = 0;

  for (const b of bookings) {
    const slot = Date.parse(b.slot_start as string);
    if (Number.isNaN(slot)) continue;

    // Never remind about a slot that already started, and hold off until the
    // conversation is actually matched to a listener.
    if (slot <= now.getTime()) {
      skipped++;
      continue;
    }
    if (!b.listener_id) {
      skipped++;
      continue;
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", b.user_id)
      .maybeSingle();

    if (!profile?.email) {
      skipped++;
      continue;
    }

    const firstName =
      (profile.full_name ?? "").trim().split(/\s+/)[0] || "there";
    const result = await sendBookingReminderEmail({
      to: profile.email,
      first_name: firstName,
      slot_start: b.slot_start as string,
    });

    if (result.sent) {
      sent++;
      await admin
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", b.id)
        .is("reminder_sent_at", null);
    } else {
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    at: now.toISOString(),
  });
}
