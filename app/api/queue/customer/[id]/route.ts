import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Listener-only: fetch a consumer's profile + signup answers so the listener
 * can review before a session. Gated so only customers currently in the
 * listener's care can be viewed (waiting in the pool, or assigned to this
 * listener via a queue entry). Sensitive fields (email, phone) are withheld.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: listener } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!listener || listener.role !== "listener") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Must be assigned to this customer via a queue entry, or the customer is waiting.
  const { data: entry } = await admin
    .from("queue_entries")
    .select("id")
    .eq("user_id", id)
    .in("status", ["waiting", "assigned", "connected"])
    .or(`assigned_listener_id.eq.${user.id},status.eq.waiting`)
    .maybeSingle();

  if (!entry) {
    return NextResponse.json(
      { error: "This consumer isn't in your care right now." },
      { status: 403 },
    );
  }

  const { data: customer, error: cErr } = await admin
    .from("profiles")
    .select(
      "full_name, gender_identity, age_range, pronouns, country, reason, prior_therapy, relationship_status, sexual_orientation, religion_importance, spiritual, services_consent, profile_complete",
    )
    .eq("id", id)
    .maybeSingle();

  if (cErr || !customer) {
    return NextResponse.json({ error: "Consumer not found." }, { status: 404 });
  }

  return NextResponse.json({ customer });
}
