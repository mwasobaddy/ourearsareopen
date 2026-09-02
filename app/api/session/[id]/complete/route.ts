import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pauseListenerQueue,
  createNotification,
} from "@/lib/session-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Participant-only: mark a session completed, set ended_at, and — if the
 * listener has recorded notes — create a `documents` row (session_notes) so
 * it shows up in history and can be downloaded/exported.
 *
 * Returns the finalized session plus the new document (if created).
 */
export async function POST(
  _req: NextRequest,
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

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await admin
    .from("sessions")
    .update({ status: "completed", ended_at: now })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "Couldn't finalize the session." },
      { status: 500 },
    );
  }

  let document = null;
  // If the listener recorded notes, persist a session-notes document.
  if (session.listener_id === user.id && session.notes) {
    const { data: doc, error: docError } = await admin
      .from("documents")
      .insert({
        session_id: id,
        user_id: session.user_id,
        listener_id: session.listener_id,
        type: "session_notes",
        title: "Session notes",
        summary: session.notes,
      })
      .select("*")
      .single();
    if (!docError && doc) document = doc;
  }

  // Enforced debrief time: completing a session pauses the listener's queue
  // availability so they take a breather before hearing someone new.
  await pauseListenerQueue(session.listener_id);

  // Notify the customer that their session is complete.
  await createNotification({
    userId: session.user_id,
    type: "session_complete",
    title: "Session completed",
    body: session.notes
      ? "Your session has been completed and your listener shared notes with you."
      : "Your session has been completed. Thank you for trusting us.",
    link: "/profile",
  });

  return NextResponse.json({ session: updated, document });
}
