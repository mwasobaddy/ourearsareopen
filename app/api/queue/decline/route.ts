import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/session-ops";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  queue_entry_id: z.string().uuid(),
  reason: z.string().trim().min(1).max(200),
});

/**
 * Listener-only: decline a waiting consumer in the open queue, with a reason
 * (SCOPE 5.3 / 7.5). Marks the entry `declined`, records the reason, frees the
 * queue slot (everyone behind moves up), and gently notifies the consumer.
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
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    return NextResponse.json(
      { error: "Only listeners can decline sessions." },
      { status: 403 },
    );
  }

  const { data: entry } = await admin
    .from("queue_entries")
    .select("id, status, position, user_id")
    .eq("id", parsed.queue_entry_id)
    .eq("status", "waiting")
    .maybeSingle();

  if (!entry) {
    return NextResponse.json(
      { error: "That consumer is no longer waiting." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  await admin
    .from("queue_entries")
    .update({
      status: "declined",
      decline_reason: parsed.reason,
      position: null,
      assigned_listener_id: user.id,
      updated_at: now,
    })
    .eq("id", entry.id);

  // Everyone behind the declined consumer moves up a spot.
  if (entry.position != null) {
    await admin.rpc("decrement_positions_after", {
      p_before_position: entry.position,
    });
  }

  // Gently let the consumer know their spot opened up.
  await createNotification({
    userId: entry.user_id,
    type: "queue_declined",
    title: "Ready to connect another way",
    body: "The listener stepped aside. You can rejoin the queue or book a scheduled conversation — we're here for you.",
    link: "/chat-queue",
  });

  return NextResponse.json({ ok: true, queue_entry_id: entry.id });
}