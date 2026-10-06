import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/session-ops";

type Admin = ReturnType<typeof createAdminClient>;

export type OpenBookingRequest = {
  bookingId: string;
  type: string;
  slotStart: string | null;
};

/**
 * Tell every active listener that a booking request is open and waiting for
 * someone to accept it. Mirrors the queue's "you're available" fan-out so a
 * scheduled request never sits invisible.
 */
export async function notifyListenersOfOpenBooking({
  bookingId,
  type,
  slotStart,
}: OpenBookingRequest): Promise<void> {
  const admin = createAdminClient();

  const { data: listeners } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "listener")
    .eq("is_active", true);

  const when = slotStart
    ? new Date(slotStart).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "the requested time";

  for (const listener of listeners ?? []) {
    await createNotification({
      userId: listener.id,
      type: "booking_open",
      title: "New conversation request",
      body: `A customer wants a ${type} conversation at ${when}. Accept it from your Appointments page.`,
      link: "/team-member/appointments",
    });
  }
}

/**
 * Assign a listener to a booking, claiming one of their availability slots when
 * the requested window matches one. Shared by the listener accept route and
 * the admin assignment route so both paths behave identically.
 *
 * Returns the updated booking, or an error message to surface to the caller.
 */
export async function assignBookingToListener({
  bookingId,
  listenerId,
  admin,
  assignedBy,
}: {
  bookingId: string;
  listenerId: string;
  admin: Admin;
  assignedBy?: string;
}): Promise<
  | { ok: true; listenerName: string | null; customerId: string }
  | { ok: false; status: number; error: string }
> {
  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, user_id, type, status, listener_id, slot_start, slot_end, payment_option",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) {
    return { ok: false, status: 404, error: "Booking not found." };
  }
  if (booking.listener_id && booking.listener_id !== listenerId) {
    return {
      ok: false,
      status: 409,
      error: "Another listener already took this conversation.",
    };
  }
  if (booking.status === "cancelled" || booking.status === "completed") {
    return {
      ok: false,
      status: 409,
      error: "This booking can no longer be assigned.",
    };
  }
  if (booking.payment_option === "paid" && booking.status !== "confirmed") {
    return {
      ok: false,
      status: 409,
      error: "This conversation isn't paid for yet.",
    };
  }

  const { data: listener } = await admin
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", listenerId)
    .maybeSingle();

  if (!listener || listener.role !== "listener" || !listener.is_active) {
    return {
      ok: false,
      status: 400,
      error: "That person isn't an active listener.",
    };
  }

  // A listener can't hold two conversations at the same time.
  if (booking.slot_start && booking.slot_end) {
    const { data: clash } = await admin
      .from("bookings")
      .select("id")
      .eq("listener_id", listenerId)
      .neq("id", booking.id)
      .in("status", ["pending", "confirmed"])
      .not("slot_start", "is", null)
      .lt("slot_start", booking.slot_end)
      .gt("slot_end", booking.slot_start);

    if (clash && clash.length > 0) {
      return {
        ok: false,
        status: 409,
        error: "You already have a conversation booked at that time.",
      };
    }
  }

  const { error } = await admin
    .from("bookings")
    .update({ listener_id: listenerId, assigned_at: new Date().toISOString() })
    .eq("id", booking.id)
    .is("listener_id", null);

  if (error) {
    return { ok: false, status: 500, error: "Couldn't assign the listener." };
  }

  // Claim the matching availability slot when the listener published one, so
  // the window stops showing as bookable elsewhere.
  if (booking.slot_start && booking.slot_end) {
    await admin
      .from("availability_slots")
      .update({ is_booked: true, booking_id: booking.id })
      .eq("listener_id", listenerId)
      .eq("starts_at", booking.slot_start)
      .eq("ends_at", booking.slot_end)
      .eq("is_booked", false);
  }

  await createNotification({
    userId: booking.user_id,
    type: "booking_assigned",
    title: `${listener.full_name ?? "A listener"} is confirmed for your conversation`,
    body: "Your conversation is matched. Open it from your profile when it's time.",
    link: `/session/${booking.id}?origin=booking`,
  });

  if (assignedBy) {
    await createNotification({
      userId: listenerId,
      type: "booking_assigned",
      title: "A conversation was assigned to you",
      body: "An admin matched you with a customer. See it under Appointments.",
      link: "/team-member/appointments",
    });
  }

  return {
    ok: true,
    listenerName: listener.full_name ?? null,
    customerId: booking.user_id,
  };
}

/**
 * Move the booking a session came from into a terminal state, so the customer's
 * profile doesn't keep showing a "Confirmed" conversation that already
 * happened. Booking-backed sessions close as `completed`; queue sessions have
 * no booking to update.
 */
export async function syncBookingFromSession({
  session,
  status,
}: {
  session: { booking_id: string | null };
  status: "completed" | "cancelled";
}): Promise<void> {
  if (!session.booking_id) return;

  const admin = createAdminClient();
  await admin
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", session.booking_id)
    .in("status", ["pending", "confirmed"]);
}
