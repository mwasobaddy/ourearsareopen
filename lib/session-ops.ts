import { createAdminClient } from "@/lib/supabase/admin";
import { getStartOfWeek, hoursBetween } from "@/lib/admin-data";

export type NotificationInput = {
  userId: string;
  type?: string;
  title: string;
  body?: string | null;
  link?: string | null;
};

/**
 * Insert an in-app notification (service-role). Owner sees it via RLS.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: NotificationInput) {
  const admin = createAdminClient();
  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type: type ?? "general",
    title,
    body: body ?? null,
    link: link ?? null,
  });
  if (error) {
    console.error("createNotification failed:", error.message);
  }
  return { error };
}

/**
 * Sum a listener's completed/ended session hours that started this (Mon-start) week.
 */
export async function getListenerWeeklyHours(listenerId: string): Promise<number> {
  const admin = createAdminClient();
  const weekStart = getStartOfWeek(new Date()).toISOString();
  const { data: sessions } = await admin
    .from("sessions")
    .select("started_at, ended_at")
    .eq("listener_id", listenerId)
    .in("status", ["ended", "completed"]);

  let hours = 0;
  for (const s of sessions ?? []) {
    if (!s.started_at || !s.ended_at) continue;
    if (s.started_at >= weekStart) {
      hours += hoursBetween(s.started_at, s.ended_at);
    }
  }
  return Math.round(hours * 100) / 100;
}

/**
 * True when the listener has already hit the 15 hr/week (1099) cap.
 */
export async function listenerAtHoursCap(listenerId: string): Promise<{
  atCap: boolean;
  hoursThisWeek: number;
}> {
  const hours = await getListenerWeeklyHours(listenerId);
  return { atCap: hours >= 15, hoursThisWeek: hours };
}

/**
 * Free the availability slot linked to a booking when it is no-show/cancelled/rescheduled.
 */
export async function freeSlotForBooking(bookingId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("availability_slots")
    .update({ is_booked: false, booking_id: null })
    .eq("booking_id", bookingId);
}

/**
 * Count listeners currently available for the open queue.
 */
export async function getListenersAvailableCount(): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "listener")
    .eq("open_queue_enabled", true);
  return count ?? 0;
}

/**
 * Pause a listener's queue availability (used for enforced debrief time).
 */
export async function pauseListenerQueue(listenerId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ open_queue_enabled: false })
    .eq("id", listenerId);
}