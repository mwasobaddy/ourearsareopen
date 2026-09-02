import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { freeSlotForBooking } from "@/lib/session-ops";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slot_start: z.string().datetime(),
  slot_end: z.string().datetime(),
});

/**
 * Reschedule a booking: the customer picks a new, unbooked availability slot
 * from the same listener. Frees the old slot and moves the booking (and any
 * existing session origin) to the new window.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

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
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (new Date(parsed.slot_end) <= new Date(parsed.slot_start)) {
    return NextResponse.json(
      { error: "The new time window is invalid." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status === "completed" || booking.status === "cancelled") {
    return NextResponse.json(
      { error: "This booking can no longer be rescheduled." },
      { status: 409 },
    );
  }
  if (!booking.listener_id) {
    return NextResponse.json(
      { error: "No listener is assigned to this booking yet." },
      { status: 409 },
    );
  }
  if (new Date(booking.slot_start ?? 0) < new Date()) {
    return NextResponse.json(
      { error: "This appointment has already passed." },
      { status: 409 },
    );
  }

  // The new window must be an existing, unbooked slot from the same listener.
  const { data: slot } = await admin
    .from("availability_slots")
    .select("id")
    .eq("listener_id", booking.listener_id)
    .eq("starts_at", parsed.slot_start)
    .eq("ends_at", parsed.slot_end)
    .eq("is_booked", false)
    .maybeSingle();

  if (!slot) {
    return NextResponse.json(
      { error: "That slot isn't available for rescheduling." },
      { status: 409 },
    );
  }

  // Free the old slot, claim the new one, then move the booking window.
  await freeSlotForBooking(id);
  await admin
    .from("availability_slots")
    .update({ is_booked: true, booking_id: id })
    .eq("id", slot.id);

  const now = new Date().toISOString();
  const { data: updated, error } = await admin
    .from("bookings")
    .update({
      slot_start: parsed.slot_start,
      slot_end: parsed.slot_end,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: "Couldn't reschedule the booking." },
      { status: 500 },
    );
  }

  // Time slots for any pre-opened session origin update too.
  await admin
    .from("sessions")
    .update({ updated_at: now })
    .eq("booking_id", id)
    .is("started_at", null);

  return NextResponse.json({ booking: updated });
}