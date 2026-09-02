import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * List reschedule options for a booking: the listener's open (unbooked)
 * availability slots, if a listener is assigned; otherwise slots from any
 * available listener. Only the booking owner may view these.
 */
export async function GET(
  _req: NextRequest,
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

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("user_id, listener_id, slot_start")
    .eq("id", id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.slot_start && new Date(booking.slot_start) < new Date()) {
    return NextResponse.json({ error: "Past appointments can't be rescheduled." }, { status: 409 });
  }

  const nowIso = new Date().toISOString();
  let query = admin
    .from("availability_slots")
    .select("id, starts_at, ends_at")
    .eq("is_booked", false)
    .gt("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(20);

  if (booking.listener_id) {
    query = query.eq("listener_id", booking.listener_id);
  }

  const { data: slots, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Couldn't load available times." }, { status: 500 });
  }

  return NextResponse.json({ slots: slots ?? [] });
}