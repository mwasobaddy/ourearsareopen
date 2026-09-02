import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const crisisSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    description: z.string().max(500).nullable().optional(),
    phone: z.string().max(60).nullable().optional(),
    availability: z.string().max(40).nullable().optional(),
    is_primary: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "No changes provided.");

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
    parsed = crisisSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid crisis resource data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: link, error } = await admin
    .from("content_crisis")
    .update(parsed)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't update the resource." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: adminSession.userId,
    action: "content_crisis.update",
    targetType: "content_crisis",
    targetId: id,
    details: parsed,
  });

  return NextResponse.json({ link });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }
  const { id } = await ctx.params;

  const admin = createAdminClient();
  const { data: link, error } = await admin
    .from("content_crisis")
    .delete()
    .eq("id", id)
    .select("name")
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't delete the resource." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: adminSession.userId,
    action: "content_crisis.delete",
    targetType: "content_crisis",
    targetId: id,
    details: { name: link.name },
  });

  return NextResponse.json({ ok: true });
}
