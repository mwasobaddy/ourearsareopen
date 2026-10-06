import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/open — listener-only feed of booking requests that still
 * need a listener (confirmed, unassigned, upcoming).
 *
 * The service-role client is used because the customer's concern text is the
 * matching brief and profiles RLS only exposes your own row — same pattern as
 * `/api/queue/pool`.
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
      { error: "Only listeners can view open requests." },
      { status: 403 },
    );
  }

  const { data: bookings, error } = await admin
    .from("bookings")
    .select(
      "id, type, concern, slot_start, slot_end, payment_option, created_at, profiles:user_id(full_name, reason, gender_identity, age_range, pronouns)",
    )
    .is("listener_id", null)
    .eq("status", "confirmed")
    .not("slot_start", "is", null)
    .gt("slot_start", new Date().toISOString())
    .order("slot_start", { ascending: true })
    .limit(25);

  if (error) {
    return NextResponse.json(
      { error: "Couldn't load open requests." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    requests: (bookings ?? []).map((b) => ({
      id: b.id,
      type: b.type,
      concern: b.concern,
      slot_start: b.slot_start,
      slot_end: b.slot_end,
      payment_option: b.payment_option,
      created_at: b.created_at,
      customer: Array.isArray(b.profiles) ? b.profiles[0] : b.profiles,
    })),
  });
}
