import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSuperAdminSession,
  SUPER_ADMIN_UNAUTHORIZED,
} from "@/lib/super-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserRole = Database["public"]["Enums"]["user_role"];

const VALID_ROLES: UserRole[] = [
  "customer",
  "listener",
  "admin",
  "super_admin",
];

const bodySchema = z.object({
  role: z.enum(["customer", "listener", "admin", "super_admin"]),
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

  if (!VALID_ROLES.includes(parsed.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Target must exist.
  const { data: target } = await admin
    .from("profiles")
    .select("id, role, email")
    .eq("id", id)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Protect against demoting the last remaining super_admin (lockout).
  if (target.role === "super_admin" && parsed.role !== "super_admin") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if (count !== null && count <= 1) {
      return NextResponse.json(
        { error: "Cannot demote the last remaining super admin." },
        { status: 400 },
      );
    }
  }

  // Prevent a super_admin from demoting themselves from the owner role.
  if (id === session.userId && parsed.role !== "super_admin") {
    return NextResponse.json(
      { error: "You cannot change your own role." },
      { status: 400 },
    );
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.role })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update role." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "user.role_change",
    targetType: "profiles",
    targetId: id,
    details: { from: target.role, to: parsed.role },
  });

  return NextResponse.json({ ok: true });
}
