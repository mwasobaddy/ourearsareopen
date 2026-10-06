import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyListenersOfOpenBooking } from "@/lib/booking-ops";
import { getFeatureFlags } from "@/lib/feature-flags";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_MINUTES = 15;

const bodySchema = z.object({
  type: z.enum(["phone", "chat"]),
  payment_option: z.enum(["paid", "free"]).default("paid"),
  concern: z.string().trim().min(5, "Please describe what's on your mind."),
  preferences: z
    .object({
      gender: z.string().max(40).optional(),
      belief: z.string().max(40).optional(),
      language: z.string().max(40).optional(),
      orientation: z.string().max(60).optional(),
    })
    .default({}),
  slot_start: z.string().datetime({ offset: true }),
});

/**
 * POST /api/bookings — create a scheduled booking.
 *
 * Replaces the previous client-side insert so the row is written with
 * server-validated values:
 *   - the slot must be in the future and at least 30 min out,
 *   - the customer can't double-book an overlapping window,
 *   - `free` bookings are confirmed immediately (paid ones stay `pending`
 *     until the Stripe webhook captures funds),
 *   - listeners are notified as soon as the request is open.
 *
 * The listener is assigned later (listener accepts the open request, or an
 * admin assigns one) — the slot time itself comes from the customer.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? (err.issues[0]?.message ?? "Invalid request")
        : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const flags = await getFeatureFlags();
  if (parsed.type === "phone" && !flags.scheduled_phone) {
    return NextResponse.json(
      { error: "Scheduled phone conversations are currently unavailable." },
      { status: 409 },
    );
  }
  if (parsed.payment_option === "free" && !flags.free_booking) {
    return NextResponse.json(
      { error: "Free conversations are currently unavailable." },
      { status: 409 },
    );
  }

  const admin = createAdminClient();

  const slotStart = new Date(parsed.slot_start);
  const now = Date.now();
  const MIN_LEAD_MS = 30 * 60_000;

  if (slotStart.getTime() < now) {
    return NextResponse.json(
      { error: "That time has already passed. Please pick another slot." },
      { status: 400 },
    );
  }
  if (slotStart.getTime() < now + MIN_LEAD_MS) {
    return NextResponse.json(
      {
        error:
          "Please choose a time at least 30 minutes from now so a listener can be matched.",
      },
      { status: 400 },
    );
  }

  const slotEnd = new Date(slotStart.getTime() + SESSION_MINUTES * 60_000);

  // Guard against two overlapping requests from the same customer.
  // Overlap test: existing.start < newEnd AND existing.end > newStart.
  const { data: overlapping } = await admin
    .from("bookings")
    .select("id")
    .eq("user_id", user.id)
    .in("status", ["pending", "confirmed"])
    .not("slot_start", "is", null)
    .lt("slot_start", slotEnd.toISOString())
    .gt("slot_end", slotStart.toISOString());

  if (overlapping && overlapping.length > 0) {
    return NextResponse.json(
      { error: "You already have a conversation booked around that time." },
      { status: 409 },
    );
  }

  // Free conversations are confirmed on creation — no payment step exists for
  // them, so nothing else would ever move them out of `pending`.
  const isFree = parsed.payment_option === "free";
  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      user_id: user.id,
      type: parsed.type,
      payment_option: parsed.payment_option,
      concern: parsed.concern,
      preferences: parsed.preferences,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      status: isFree ? "confirmed" : "pending",
    })
    .select("id, status, payment_option, slot_start, type")
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: "Couldn't create your booking. Please try again." },
      { status: 500 },
    );
  }

  // Confirm-email + open-request notification are best effort: a booking must
  // still succeed if Resend is unreachable.
  if (isFree) {
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.email) {
      const firstName =
        (profile.full_name ?? "").trim().split(/\s+/)[0] || "there";
      void sendBookingConfirmationEmail({
        to: profile.email,
        first_name: firstName,
        type: booking.type,
        slot_start: booking.slot_start,
        listener_name: null,
      });
    }
  }

  if (booking.status === "confirmed") {
    await notifyListenersOfOpenBooking({
      bookingId: booking.id,
      type: booking.type,
      slotStart: booking.slot_start,
    });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
