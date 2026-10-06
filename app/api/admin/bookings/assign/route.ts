import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAdminSession,
  ADMIN_UNAUTHORIZED,
  ADMIN_FORBIDDEN,
} from "@/lib/api-admin-auth";
import { assignBookingToListener } from "@/lib/booking-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/bookings/assign — assign (or clear) the listener on a
 * booking from the admin dashboard. Same validation as the listener accept
 * path, so an admin can't create a double-booking either.
 */
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let bookingId: string | null = null;
  let listenerId: string | null = null;
  try {
    const body = await req.json();
    bookingId = typeof body.bookingId === "string" ? body.bookingId : null;
    listenerId =
      typeof body.listenerId === "string" && body.listenerId.length > 0
        ? body.listenerId
        : null;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  if (!listenerId) {
    const { data: booking } = await admin
      .from("bookings")
      .select("id, slot_start, slot_end")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const { data: updated, error } = await admin
      .from("bookings")
      .update({ listener_id: null, assigned_at: null })
      .eq("id", bookingId)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      return NextResponse.json(
        { error: "Couldn't clear the listener." },
        { status: 500 },
      );
    }

    // Release the availability slot the listener was holding.
    await admin
      .from("availability_slots")
      .update({ is_booked: false, booking_id: null })
      .eq("booking_id", bookingId);

    return NextResponse.json({ ok: true, listener_id: null });
  }

  const result = await assignBookingToListener({
    bookingId,
    listenerId,
    admin,
    assignedBy: session.userId,
  });

  if (!result.ok) {
    const status = result.status === 401 ? 401 : result.status;
    if (status === 401) {
      return NextResponse.json(ADMIN_FORBIDDEN, { status: 403 });
    }
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    listener_id: listenerId,
    listener_name: result.listenerName,
  });
}
