import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/session-ops";
import { sendFollowUpPaymentEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * In-session follow-up booking.
 *
 * The assigned listener (or an admin) books a follow-up appointment for the
 * consumer attached to a session, using one of the listener's own open slots.
 * The listener chooses free vs paid; if paid, the consumer is emailed a
 * payment link only — the listener never sees or processes payment.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // session_id is required so we know which listener's slots to show.
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: session } = await admin
    .from("sessions")
    .select("listener_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session?.listener_id) {
    return NextResponse.json(
      { error: "This session has no listener assigned." },
      { status: 404 },
    );
  }

  const nowIso = new Date().toISOString();
  const { data: slots } = await admin
    .from("availability_slots")
    .select("id, starts_at, ends_at")
    .eq("listener_id", session.listener_id)
    .eq("is_booked", false)
    .gt("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(30);

  return NextResponse.json({ slots: slots ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body.session_id === "string" ? body.session_id : null;
  const slotId = typeof body.slot_id === "string" ? body.slot_id : null;
  const isPaid = body.is_paid === true;
  const concern =
    typeof body.concern === "string" && body.concern.trim()
      ? body.concern.trim().slice(0, 2000)
      : null;

  if (!sessionId || !slotId) {
    return NextResponse.json(
      { error: "Session and a chosen time are required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: session } = await admin
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const isListener = profile?.role === "listener" && session.listener_id === user.id;
  const isStaff = profile?.role === "admin" || profile?.role === "super_admin";

  if (!isListener && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!session.user_id) {
    return NextResponse.json(
      { error: "This session has no attached consumer." },
      { status: 400 },
    );
  }

  // The chosen slot must be the session listener's own, unbooked, in the future.
  const { data: slot } = await admin
    .from("availability_slots")
    .select("*")
    .eq("id", slotId)
    .eq("listener_id", session.listener_id)
    .eq("is_booked", false)
    .maybeSingle();

  if (!slot || !slot.starts_at) {
    return NextResponse.json(
      { error: "That time isn't available for a follow-up." },
      { status: 409 },
    );
  }
  if (new Date(slot.starts_at) < new Date()) {
    return NextResponse.json(
      { error: "Please pick a time in the future." },
      { status: 409 },
    );
  }

  const { data: booking, error: insertError } = await admin
    .from("bookings")
    .insert({
      user_id: session.user_id,
      listener_id: session.listener_id,
      type: session.mode === "phone" ? "phone" : "chat",
      payment_option: isPaid ? "paid" : "free",
      concern: concern ?? "Follow-up arranged in-session.",
      preferences: {},
      slot_start: slot.starts_at,
      slot_end: slot.ends_at,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError || !booking) {
    return NextResponse.json(
      { error: "Couldn't create the follow-up booking." },
      { status: 500 },
    );
  }

  // Claim the slot.
  await admin
    .from("availability_slots")
    .update({ is_booked: true, booking_id: booking.id })
    .eq("id", slot.id);

  // Tell the consumer a follow-up is set up (points them to their profile).
  const profileLink = `/profile`;
  await createNotification({
    userId: session.user_id,
    type: "booking",
    title: isPaid
      ? "Your listener scheduled a follow-up"
      : "Free follow-up booked for you",
    body: isPaid
      ? "A paid follow-up is booked for you. A payment link has been sent to your email to confirm your slot."
      : "Your listener has booked you a free follow-up. You'll see it in your profile.",
    link: profileLink,
  });

  await createNotification({
    userId: session.listener_id,
    type: "booking",
    title: "Follow-up booked",
    body: `Follow-up ${isPaid ? "(paid — consumer pays via email link)" : "(free)"} synced to your schedule.`,
    link: "/team-member/appointments",
  });

  // Paid: email the consumer a payment link ONLY (they may be offline).
  if (isPaid) {
    const { data: consumer } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", session.user_id)
      .maybeSingle();

    const paymentUrl = `${new URL(req.url).origin}/payment?booking=${booking.id}`;
    if (consumer?.email) {
      await sendFollowUpPaymentEmail({
        to: consumer.email,
        first_name: consumer.full_name ?? "there",
        slot_start: booking.slot_start,
        payment_url: paymentUrl,
      });
    }
  }

  return NextResponse.json({ booking });
}