import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = Database["public"]["Enums"]["user_role"];

function inArr(...values: Role[]): Role[] {
  return values;
}

const SEGMENTS: { id: string; label: string; roles?: Role[] }[] = [
  { id: "customers", label: "All customers", roles: ["customer"] },
  { id: "listeners", label: "All listeners", roles: ["listener"] },
  {
    id: "team",
    label: "All team (listeners + admins)",
    roles: ["listener", "admin", "super_admin"],
  },
  { id: "all", label: "Everyone" },
];

/**
 * GET /api/admin/email-segments
 * Admin/super-admin: list available campaign segments with recipient counts,
 * so the admin UI can show a preview before sending.
 */
export async function GET(_req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  const admin = createAdminClient();

  const segments = await Promise.all(
    SEGMENTS.map(async (s) => {
      let query = admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .not("email", "is", null);
      if (s.roles) {
        query = query.in("role", inArr(...s.roles));
      }
      const { count } = await query;
      return { id: s.id, label: s.label, count: count ?? 0 };
    }),
  );

  return NextResponse.json({ segments });
}