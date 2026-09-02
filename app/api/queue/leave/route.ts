import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Leave the open queue. Marks the caller's waiting entry as `left` (or
 * releases an assigned match) and moves everyone behind them up a spot.
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
  const { data: entry } = await admin
    .from("queue_entries")
    .select("id, status, position")
    .eq("user_id", user.id)
    .in("status", ["waiting", "assigned"])
    .maybeSingle();

  if (!entry) {
    return NextResponse.json({ ok: true, alreadyLeft: true });
  }

  const now = new Date().toISOString();
  await admin
    .from("queue_entries")
    .update({ status: "left", position: null, updated_at: now })
    .eq("id", entry.id);

  // Everyone behind the leaver moves up one spot.
  if (entry.status === "waiting" && entry.position != null) {
    await admin.rpc("decrement_positions_after", { p_before_position: entry.position });
  }

  return NextResponse.json({ ok: true, left_entry_id: entry.id });
}