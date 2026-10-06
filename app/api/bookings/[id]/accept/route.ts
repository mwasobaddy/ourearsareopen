import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assignBookingToListener } from "@/lib/booking-ops";
import { listenerAtHoursCap } from "@/lib/session-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/[id]/accept — listener takes an open booking request.
 *
 * Closes the loop that was missing from the scheduled-booking path: a booking
 * is created unassigned, listeners see the open requests, and the first to
 * accept owns the conversation. The customer is notified and can open the
 * session room from their profile.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json(
      { error: "Only listeners can accept conversations." },
      { status: 403 },
    );
  }
  if (!profile.is_active) {
    return NextResponse.json(
      { error: "Your listener account is inactive." },
      { status: 403 },
    );
  }

  // Enforce the 15 hr/week (1099) cap, same as the queue accept path.
  const { atCap, hoursThisWeek } = await listenerAtHoursCap(user.id);
  if (atCap) {
    return NextResponse.json(
      {
        error: "You have reached the 15 hr/week cap for this pay period.",
        hoursThisWeek,
      },
      { status: 409 },
    );
  }

  const result = await assignBookingToListener({
    bookingId: id,
    listenerId: user.id,
    admin,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, booking_id: id });
}
