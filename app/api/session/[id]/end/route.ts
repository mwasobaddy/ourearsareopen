import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * Participant-only: end a session immediately (safety disconnect / wrap-up)
 * and record why it ended. Unlike the in-page "End Session" click, this
 * writes `end_reason` so the audible history has context.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

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
  const { data: session } = await admin
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (user.id !== session.user_id && user.id !== session.listener_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (
    session.status === "ended" ||
    session.status === "completed" ||
    session.status === "pending"
  ) {
    return NextResponse.json(
      { error: "This session cannot be ended." },
      { status: 409 },
    );
  }

  const endReason = parsed.reason?.trim()
    ? `${user.id === session.listener_id ? "listener" : "consumer"}: ${parsed.reason.trim()}`
    : null;

  const { data: updated, error } = await admin
    .from("sessions")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
      end_reason: endReason,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: "Couldn't end the session." },
      { status: 500 },
    );
  }

  return NextResponse.json({ session: updated });
}