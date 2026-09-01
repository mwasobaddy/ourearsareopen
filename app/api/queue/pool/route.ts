import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Listener-only: return the current waiting pool (FIFO) with the customer's
 * profile info (name + reason) so the listener can review before accepting.
 * Uses the admin client so granular profile data stays behind this endpoint
 * (the public profiles RLS only exposes your own row).
 */
export async function GET(_req: NextRequest) {
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json(
      { error: "Only listeners can view the pool." },
      { status: 403 },
    );
  }

  const { data: entries, error } = await admin
    .from("queue_entries")
    .select(
      "id, user_id, created_at, profiles:user_id(full_name, reason, gender_identity, age_range)",
    )
    .eq("status", "waiting")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Couldn't load the pool." }, { status: 500 });
  }

  return NextResponse.json({
    pool: entries.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      created_at: e.created_at,
      // profiles may be an array depending on embedding shape
      customer: Array.isArray(e.profiles) ? e.profiles[0] : e.profiles,
    })),
  });
}
