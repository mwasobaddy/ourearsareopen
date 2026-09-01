import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Listener weekly availability (profiles.availability).
 * GET: fetch current schedule. PUT: save it.
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
    .select("availability, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ availability: profile.availability ?? {} });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let availability: unknown;
  try {
    const body = await req.json();
    availability = body.availability;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof availability !== "object" || availability === null) {
    return NextResponse.json(
      { error: "availability must be an object" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await admin
    .from("profiles")
    .update({ availability: availability as Record<string, string[]> })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
