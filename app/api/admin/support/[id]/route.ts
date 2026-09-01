import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["resolve", "reopen", "note"]),
  internal_notes: z.string().optional().default(""),
});

/**
 * Admin-only: resolve/reopen a support ticket, or append an internal note.
 */
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
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (parsed.action === "note") {
    const { data: current } = await admin
      .from("support_tickets")
      .select("internal_notes")
      .eq("id", id)
      .maybeSingle();
    const merged = [current?.internal_notes, parsed.internal_notes]
      .filter(Boolean)
      .join("\n");
    const { data: ticket, error } = await admin
      .from("support_tickets")
      .update({ internal_notes: merged || null })
      .eq("id", id)
      .select("*")
      .single();
    if (error || !ticket) {
      return NextResponse.json(
        { error: "Couldn't update the ticket." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ticket });
  }

  const resolved =
    parsed.action === "resolve" ? new Date().toISOString() : null;
  const { data: ticket, error } = await admin
    .from("support_tickets")
    .update({
      status: parsed.action === "resolve" ? "resolved" : "open",
      resolved_at: resolved,
      internal_notes: parsed.internal_notes || undefined,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { error: "Couldn't update the ticket." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ticket });
}
