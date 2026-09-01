import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSuperAdminSession,
  SUPER_ADMIN_UNAUTHORIZED,
} from "@/lib/super-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  is_active: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSuperAdminSession();
  if (!session) {
    return NextResponse.json(SUPER_ADMIN_UNAUTHORIZED, { status: 401 });
  }

  const { id } = await params;
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Prevent deactivating the last remaining active super admin.
  if (target.role === "super_admin" && parsed.is_active === false) {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if (count !== null && count <= 1) {
      return NextResponse.json(
        { error: "Cannot deactivate the last active super admin." },
        { status: 400 },
      );
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_active: parsed.is_active })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update status." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: session.userId,
    action: parsed.is_active ? "user.reactivate" : "user.deactivate",
    targetType: "profiles",
    targetId: id,
    details: { role: target.role },
  });

  return NextResponse.json({ ok: true });
}
