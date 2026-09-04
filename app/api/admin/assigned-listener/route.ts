import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  userId: z.string().uuid(),
  listenerId: z.string().uuid().nullish(),
});

/**
 * GET /api/admin/assigned-listener?userId=<uuid>
 * Admin/super-admin: read a customer's currently assigned listener.
 */
export async function GET(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: customer } = await admin
    .from("profiles")
    .select("id, full_name, assigned_listener_id")
    .eq("id", userId)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  let listener = null;
  if (customer.assigned_listener_id) {
    const { data: l } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", customer.assigned_listener_id)
      .maybeSingle();
    listener = l;
  }

  return NextResponse.json({
    customer,
    assignedListener: listener,
  });
}

/**
 * PATCH /api/admin/assigned-listener
 * Admin/super-admin: set (or clear, listenerId=null) a customer's assigned
 * listener. Validates the target is a `customer` and the new value (when
 * present) is an active `listener`.
 */
export async function PATCH(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed: z.infer<typeof patchSchema>;
  try {
    parsed = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", parsed.userId)
    .maybeSingle();
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }
  if (customer.role !== "customer") {
    return NextResponse.json(
      { error: "Only customer profiles can be assigned a listener." },
      { status: 400 },
    );
  }

  if (parsed.listenerId) {
    const { data: listener } = await admin
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", parsed.listenerId)
      .maybeSingle();
    if (!listener || listener.role !== "listener") {
      return NextResponse.json(
        { error: "Assigned user must be a listener profile." },
        { status: 400 },
      );
    }
    if (!listener.is_active) {
      return NextResponse.json(
        { error: "Cannot assign an inactive listener." },
        { status: 400 },
      );
    }
  }

  const { data, error } = await admin
    .from("profiles")
    .update({ assigned_listener_id: parsed.listenerId ?? null })
    .eq("id", parsed.userId)
    .select("id, full_name, assigned_listener_id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Couldn't update the assignment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ customer: data });
}