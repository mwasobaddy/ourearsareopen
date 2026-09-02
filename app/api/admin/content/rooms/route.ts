import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roomSchema = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or hyphens."),
  title: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(40).default("messages-square"),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("content_rooms")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: "Couldn't load rooms." }, { status: 500 });
  }
  return NextResponse.json({ rooms: data });
}

export async function POST(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed;
  try {
    parsed = roomSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid room data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: room, error } = await admin
    .from("content_rooms")
    .insert({
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description ?? null,
      icon: parsed.icon,
      sort_order: parsed.sort_order,
      is_active: parsed.is_active,
    })
    .select("*")
    .single();

  if (error) {
    const message = error.code === "23505" ? "A room with that slug already exists." : "Couldn't create the room.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await writeAuditLog({
    actorId: adminSession.userId,
    action: "content_room.create",
    targetType: "content_room",
    targetId: room.id,
    details: { slug: room.slug, title: room.title },
  });

  return NextResponse.json({ room }, { status: 201 });
}
