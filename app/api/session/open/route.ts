import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    queue_entry_id: z.string().uuid().optional(),
    booking_id: z.string().uuid().optional(),
    mode: z.enum(["chat", "phone"]).optional(),
  })
  .refine((v) => v.queue_entry_id || v.booking_id, {
    message: "Provide a queue_entry_id or booking_id",
  });

/**
 * Open (or fetch) the live session for a queue entry or a booking.
 *
 * Only a participant — the customer (user_id) or the assigned listener
 * (listener_id) — may open the session. Opening sets the session to
 * `active`, records `started_at`, and marks a queue entry as `connected`.
 *
 * Voice (phone) sessions are created the same way; the Twilio/LiveKit
 * connection itself is client-blocked (Module 6 voice TO-DO).
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
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  let userId: string;
  let listenerId: string;
  let mode: "chat" | "phone" = "chat";
  let origin: {
    queue_entry_id?: string;
    booking_id?: string;
  } = {};

  if (parsed.queue_entry_id) {
    const { data: entry, error } = await admin
      .from("queue_entries")
      .select("id, user_id, assigned_listener_id, status")
      .eq("id", parsed.queue_entry_id)
      .maybeSingle();

    if (error || !entry || !entry.assigned_listener_id) {
      return NextResponse.json(
        { error: "Queue entry not found or not yet assigned." },
        { status: 404 },
      );
    }
    if (user.id !== entry.user_id && user.id !== entry.assigned_listener_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    userId = entry.user_id;
    listenerId = entry.assigned_listener_id;
    mode = "chat";
    origin = { queue_entry_id: entry.id };
  } else if (parsed.booking_id) {
    const { data: booking, error } = await admin
      .from("bookings")
      .select("id, user_id, listener_id, type, status")
      .eq("id", parsed.booking_id)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (user.id !== booking.user_id && user.id !== booking.listener_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!booking.listener_id) {
      return NextResponse.json(
        { error: "No listener assigned to this booking." },
        { status: 404 },
      );
    }

    userId = booking.user_id;
    listenerId = booking.listener_id;
    mode = parsed.mode ?? (booking.type === "phone" ? "phone" : "chat");
    origin = { booking_id: booking.id };
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Reuse an existing open session for this origin, else create one.
  const originColumn = origin.queue_entry_id ? "queue_entry_id" : "booking_id";
  const originValue = (origin.queue_entry_id ?? origin.booking_id)!;

  const { data: existing } = await admin
    .from("sessions")
    .select("*")
    .eq(originColumn, originValue)
    .in("status", ["pending", "active", "left"])
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ session: existing, alreadyOpen: true });
  }

  const startedAt = new Date().toISOString();
  const { data: session, error: insertError } = await admin
    .from("sessions")
    .insert({
      user_id: userId,
      listener_id: listenerId,
      queue_entry_id: origin.queue_entry_id ?? null,
      booking_id: origin.booking_id ?? null,
      mode,
      status: "active",
      started_at: startedAt,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Could not open the session." },
      { status: 500 },
    );
  }

  // Mark the queue entry as connected when the session opens.
  if (origin.queue_entry_id) {
    await admin
      .from("queue_entries")
      .update({ status: "connected" })
      .eq("id", origin.queue_entry_id);
  }

  return NextResponse.json({ session, alreadyOpen: false });
}
