import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roomSchema = z
  .object({
    slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/).optional(),
    title: z.string().min(1).max(80).optional(),
    description: z.string().max(500).nullable().optional(),
    icon: z.string().max(40).optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
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
    parsed = roomSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid room data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: room, error } = await admin
    .from("content_rooms")
    .update(parsed)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    const message = error.code === "23505" ? "A room with that slug already exists." : "Couldn't update the room.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await writeAuditLog({
    actorId: adminSession.userId,
    action: "content_room.update",
    targetType: "content_room",
    targetId: id,
    details: parsed,
  });

  return NextResponse.json({ room });
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
  const { data: room, error } = await admin
    .from("content_rooms")
    .delete()
    .eq("id", id)
    .select("slug, title")
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't delete the room." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: adminSession.userId,
    action: "content_room.delete",
    targetType: "content_room",
    targetId: id,
    details: { slug: room.slug, title: room.title },
  });

  return NextResponse.json({ ok: true });
}
