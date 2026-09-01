import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  kind: z.enum(["refund", "support"]).default("support"),
  subject: z.string().min(1),
  description: z.string().optional().default(""),
  user_id: z.string().uuid().optional().nullable(),
  payment_id: z.string().uuid().optional().nullable(),
  internal_notes: z.string().optional().default(""),
});

/**
 * Admin-only: create a support/refund ticket. For refunds, the actual Stripe
 * refund is issued client-side once Stripe keys are configured; this records
 * the request for the audit trail.
 */
export async function POST(req: NextRequest) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(ADMIN_UNAUTHORIZED, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: ticket, error } = await admin
    .from("support_tickets")
    .insert({
      kind: parsed.kind,
      subject: parsed.subject,
      description: parsed.description || null,
      internal_notes: parsed.internal_notes || null,
      user_id: parsed.user_id ?? null,
      payment_id: parsed.payment_id ?? null,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { error: "Couldn't create the ticket." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ticket }, { status: 201 });
}
