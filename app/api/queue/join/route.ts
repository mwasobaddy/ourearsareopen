import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  payment_id: z.string().uuid(),
});

/**
 * Join the open chat queue after a successful (succeeded) queue payment.
 *
 * - Verifies the payment belongs to the current user, is a `queue` payment,
 *   and has already succeeded (confirmed by the Stripe webhook).
 * - Inserts a waiting queue entry.
 * - If a listener is currently "available for queue", assigns the earliest
 *   waiting customer immediately (FIFO).
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

  // The payment must be one of this user's, of type queue, and succeeded.
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("id, user_id, type, status")
    .eq("id", parsed.payment_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (paymentError || !payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  if (payment.type !== "queue") {
    return NextResponse.json(
      { error: "This payment is not a queue join." },
      { status: 400 },
    );
  }
  if (payment.status !== "succeeded") {
    return NextResponse.json(
      { error: "Payment has not been completed yet." },
      { status: 402 },
    );
  }

  // Is the user already waiting or assigned in an active entry?
  const { data: activeEntry } = await admin
    .from("queue_entries")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["waiting", "assigned", "connected"])
    .maybeSingle();

  if (activeEntry) {
    return NextResponse.json({ entry: activeEntry, alreadyJoined: true });
  }

  // FIFO matching: pick the earliest open-listener so the queue is fair.
  const { data: listener } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "listener")
    .eq("open_queue_enabled", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (listener) {
    const { data: entry, error: insertError } = await admin
      .from("queue_entries")
      .insert({
        user_id: user.id,
        payment_id: payment.id,
        status: "assigned",
        assigned_listener_id: listener.id,
        assigned_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Could not join the queue." },
        { status: 500 },
      );
    }
    return NextResponse.json({ entry, alreadyJoined: false });
  }

  // No listener available right now — park the customer in the waiting pool.
  const { count: waitingAhead } = await admin
    .from("queue_entries")
    .select("id", { count: "exact", head: true })
    .eq("status", "waiting");

  const { data: entry, error: insertError } = await admin
    .from("queue_entries")
    .insert({
      user_id: user.id,
      payment_id: payment.id,
      status: "waiting",
      position: (waitingAhead ?? 0) + 1,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not join the queue." }, { status: 500 });
  }

  return NextResponse.json({ entry, alreadyJoined: false });
}
