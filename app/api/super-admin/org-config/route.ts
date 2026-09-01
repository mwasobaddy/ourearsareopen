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
  org_name: z.string().min(1).max(120).optional(),
  logo_url: z.string().url().or(z.literal("")).nullable().optional(),
  support_email: z.string().email().nullable().optional(),
  timezone: z.string().min(1).max(64).optional(),
  crisis_links: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) {
    return NextResponse.json(SUPER_ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const update: Record<string, unknown> = {
    ...parsed,
    updated_at: new Date().toISOString(),
    updated_by: session.userId,
  };
  if (parsed.logo_url === "") update.logo_url = null;

  const { error } = await admin
    .from("org_config")
    .update(update as never)
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: "Could not save config." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "org_config.update",
    targetType: "org_config",
    targetId: "1",
    details: { fields: Object.keys(parsed) },
  });

  return NextResponse.json({ ok: true });
}
