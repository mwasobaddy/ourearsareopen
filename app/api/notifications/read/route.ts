import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional(),
});

/**
 * Mark the signed-in user's notifications as read (by id, or all).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  let query = admin
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (!parsed.markAll && parsed.notificationIds && parsed.notificationIds.length > 0) {
    query = query.in("id", parsed.notificationIds);
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: "Couldn't update notifications." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}