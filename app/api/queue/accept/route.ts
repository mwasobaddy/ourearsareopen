import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  queue_entry_id: z.string().uuid(),
});

/**
 * Listener-only: accept a specific waiting customer (FIFO is recommended but
 * the pool page lets the listener choose one). Assigns that entry to this
 * listener and marks it `assigned`, then moves everyone behind up a spot.
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
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json(
      { error: "Only listeners can accept sessions." },
      { status: 403 },
    );
  }

  const { data: entry } = await admin
    .from("queue_entries")
    .select("id, status")
    .eq("id", parsed.queue_entry_id)
    .eq("status", "waiting")
    .maybeSingle();

  if (!entry) {
    return NextResponse.json(
      { error: "That customer is no longer waiting." },
      { status: 409 },
    );
  }

  await admin
    .from("queue_entries")
    .update({
      status: "assigned",
      assigned_listener_id: user.id,
      assigned_at: new Date().toISOString(),
    })
    .eq("id", entry.id);

  // Everyone behind them moves up one spot.
  await admin.rpc("decrement_waiting_positions");

  return NextResponse.json({ ok: true, queue_entry_id: entry.id });
}
