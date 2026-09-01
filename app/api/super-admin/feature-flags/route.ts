import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSuperAdminSession,
  SUPER_ADMIN_UNAUTHORIZED,
} from "@/lib/super-admin-auth";
import { writeAuditLog } from "@/lib/super-admin-data";
import { z } from "zod";
import type { FeatureFlagKey } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_KEYS: FeatureFlagKey[] = [
  "open_queue",
  "donations",
  "free_booking",
  "scheduled_phone",
];

const bodySchema = z.record(
  z.string(),
  z.object({ enabled: z.boolean(), description: z.string().optional() }),
);

export async function PUT(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) {
    return NextResponse.json(SUPER_ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const changed: string[] = [];

  for (const key of VALID_KEYS) {
    const incoming = parsed[key];
    if (!incoming) continue;
    const { data: existing, error: getError } = await admin
      .from("feature_flags")
      .select("enabled, description")
      .eq("key", key)
      .maybeSingle();
    if (getError) continue;

    const { error } = await admin
      .from("feature_flags")
      .upsert(
        {
          key,
          enabled: incoming.enabled,
          description: incoming.description ?? existing?.description ?? null,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        },
        { onConflict: "key" },
      );
    if (error) {
      return NextResponse.json({ error: "Could not save flags." }, { status: 500 });
    }
    if (existing && existing.enabled !== incoming.enabled) changed.push(key);
  }

  if (changed.length > 0) {
    await writeAuditLog({
      actorId: session.userId,
      action: "feature_flags.update",
      targetType: "feature_flags",
      details: { changed },
    });
  }

  return NextResponse.json({ ok: true, changed });
}
