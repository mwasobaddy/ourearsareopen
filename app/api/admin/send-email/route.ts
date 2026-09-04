import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";
import { sendCampaignEmail } from "@/lib/email";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = Database["public"]["Enums"]["user_role"];

const sendSchema = z.object({
  segment: z.enum(["customers", "listeners", "team", "all", "user"]),
  userId: z.string().uuid().optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
});

function inArr(...values: Role[]): Role[] {
  return values;
}

/**
 * POST /api/admin/send-email
 * Admin/super-admin: send a campaign/notice to a segment of team members and
 * consumers (or a single user). Delivery is a safe no-op until Resend is
 * configured; recipients also get an in-app notification so the action is
 * useful even before email is live.
 */
export async function POST(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed: z.infer<typeof sendSchema>;
  try {
    parsed = sendSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  let recipients: { id: string; email: string | null; full_name: string | null }[] = [];

  if (parsed.segment === "user") {
    if (!parsed.userId) {
      return NextResponse.json(
        { error: "A userId is required for the user segment." },
        { status: 400 },
      );
    }
    const { data } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", parsed.userId)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    recipients = [data];
  } else {
    let query = admin
      .from("profiles")
      .select("id, email, full_name");
    if (parsed.segment === "customers") {
      query = query.eq("role", "customer");
    } else if (parsed.segment === "listeners") {
      query = query.eq("role", "listener");
    } else if (parsed.segment === "team") {
      query = query.in("role", inArr("listener", "admin", "super_admin"));
    }
    const { data } = await query;
    recipients = (data ?? []) as typeof recipients;
  }

  const emails = recipients.filter((r) => r.email);
  const ids = recipients.map((r) => r.id);

  // Send email (safe no-op until a verified Resend domain / API key).
  let emailed = 0;
  let skipped = 0;
  const batchSize = 20;
  for (let i = 0; i < emails.length; i += batchSize) {
    const slice = emails.slice(i, i + batchSize);
    for (const r of slice) {
      const res = await sendCampaignEmail({
        to: r.email!,
        subject: parsed.subject,
        body: parsed.body,
        first_name: r.full_name,
      });
      if (res.sent) emailed++;
      else if (res.skipped) skipped++;
    }
  }

  // In-app notifications so the campaign reaches users even before email is live.
  if (ids.length > 0) {
    await admin.from("notifications").insert(
      ids.map((id) => ({
        user_id: id,
        type: "campaign",
        title: parsed.subject,
        body: parsed.body.slice(0, 500),
        link: null,
      })),
    );
  }

  const total = recipients.length;
  return NextResponse.json({
    ok: true,
    total,
    delivered: emailed,
    skipped,
    noEmail: total - emails.length,
  });
}