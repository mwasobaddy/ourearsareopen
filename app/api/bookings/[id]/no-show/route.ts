import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { freeSlotForBooking } from "@/lib/session-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mark a confirmed booking as a no-show. Allowed for the assigned listener
 * or an admin. Frees the availability slot so another customer can book it.
 */
export async function POST(
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
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const isListener = profile?.role === "listener" && booking.listener_id === user.id;
  const isStaff = profile?.role === "admin" || profile?.role === "super_admin";

  if (!isListener && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "confirmed" && booking.status !== "pending") {
    return NextResponse.json(
      { error: "Only confirmed or pending bookings can be marked no-show." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("bookings")
    .update({ status: "no_show", updated_at: now })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Couldn't update the booking." },
      { status: 500 },
    );
  }

  await freeSlotForBooking(id);

  // If a session was opened for this booking, close it out with the reason.
  await admin
    .from("sessions")
    .update({
      status: "ended",
      ended_at: now,
      end_reason:
        "The consumer did not show up for their scheduled session.",
    })
    .eq("booking_id", id)
    .in("status", ["pending", "active", "left"]);

  return NextResponse.json({ ok: true });
}