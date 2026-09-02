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
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  description: z.string().max(300).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ key: string }> },
) {
  const session = await getSuperAdminSession();
  if (!session) {
    return NextResponse.json(SUPER_ADMIN_UNAUTHORIZED, { status: 401 });
  }
  const { key } = await ctx.params;

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid template data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: template, error } = await admin
    .from("email_templates")
    .update({
      subject: parsed.subject,
      body: parsed.body,
      description: parsed.description ?? null,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    })
    .eq("key", key)
    .select("key, subject, body, description")
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't save the template." }, { status: 500 });
  }

  await writeAuditLog({
    actorId: session.userId,
    action: "email_template.update",
    targetType: "email_template",
    targetId: key,
    details: { subject: template.subject },
  });

  return NextResponse.json({ template });
}
