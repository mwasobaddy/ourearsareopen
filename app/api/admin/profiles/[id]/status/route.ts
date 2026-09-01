import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  is_active: z.boolean(),
});

/**
 * Admin-only: activate/deactivate a profile (listener or consumer).
 * Soft-disable only — no data is deleted.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }
  const { id } = await ctx.params;

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .update({ is_active: parsed.is_active })
    .eq("id", id)
    .select("id, full_name, email, role, is_active")
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Couldn't update the account." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}
