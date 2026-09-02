import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const crisisSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  phone: z.string().max(60).nullable().optional(),
  availability: z.string().max(40).nullable().optional(),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("content_crisis")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: "Couldn't load crisis resources." }, { status: 500 });
  }
  return NextResponse.json({ crisis: data });
}

export async function POST(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed;
  try {
    parsed = crisisSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid crisis resource data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: link, error } = await admin
    .from("content_crisis")
    .insert({
      name: parsed.name,
      description: parsed.description ?? null,
      phone: parsed.phone ?? null,
      availability: parsed.availability ?? null,
      is_primary: parsed.is_primary,
      is_active: parsed.is_active,
      sort_order: parsed.sort_order,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't create the resource." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: adminSession.userId,
    action: "content_crisis.create",
    targetType: "content_crisis",
    targetId: link.id,
    details: { name: link.name },
  });

  return NextResponse.json({ link }, { status: 201 });
}
