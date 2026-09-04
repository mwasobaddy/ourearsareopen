import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  userId: z.string().uuid().optional(),
});

/**
 * POST /api/email/welcome — send the welcome email to the signed-in user.
 * Called by the register form right after account creation (best-effort).
 * Reads the recipient's email/name from the DB (never trusts the client body).
 * No-ops until RESEND_API_KEY is configured; returns { sent } either way.
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

  let body: z.infer<typeof bodySchema> = {};
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    body = {};
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", body.userId ?? user.id)
    .maybeSingle();

  if (!profile?.email) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  if (profile.email !== user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const firstName = (profile.full_name ?? "").trim().split(/\s+/)[0] || "there";
  const result = await sendWelcomeEmail({
    to: profile.email,
    first_name: firstName,
  });

  return NextResponse.json(result);
}