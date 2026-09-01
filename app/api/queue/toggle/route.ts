import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET: current listener queue-availability state.
 */
export async function GET() {
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
    .select("open_queue_enabled, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ open_queue_enabled: profile.open_queue_enabled });
}

/**
 * Listener availability toggle for the open queue.
 *
 * When a listener turns their availability ON, the earliest waiting customer
 * (FIFO) is auto-assigned to them, so the queue advances even if no new
 * customers are joining.
 */
export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Only listeners can toggle queue availability.
  const { data: profile } = await admin
    .from("profiles")
    .select("role, open_queue_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json(
      { error: "Only listeners can use this." },
      { status: 403 },
    );
  }

  const nextEnabled = !profile.open_queue_enabled;

  await admin
    .from("profiles")
    .update({ open_queue_enabled: nextEnabled })
    .eq("id", user.id);

  let assignedEntry = null;

  // If turning available, assign the earliest waiting customer to this listener.
  if (nextEnabled) {
    const { data: waiting } = await admin
      .from("queue_entries")
      .select("id, user_id")
      .eq("status", "waiting")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waiting) {
      await admin
        .from("queue_entries")
        .update({
          status: "assigned",
          assigned_listener_id: user.id,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", waiting.id);

      // Everyone behind them moves up one spot.
      await admin.rpc("decrement_waiting_positions");

      assignedEntry = waiting;
    }
  }

  return NextResponse.json({
    open_queue_enabled: nextEnabled,
    assignedEntry,
  });
}
