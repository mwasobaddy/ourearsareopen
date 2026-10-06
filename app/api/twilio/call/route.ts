import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  user_id: string;
  listener_id: string | null;
  mode: string;
  status: string;
  room_id: string | null;
};

function twilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKeySid: process.env.TWILIO_API_KEY_SID,
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_PHONE_NUMBER,
  };
}

function voiceUnavailable() {
  const c = twilioConfig();
  const hasCredentials =
    (!!c.apiKeySid && !!c.apiKeySecret) || !!c.authToken;
  if (!c.from || !c.accountSid || !hasCredentials) {
    return NextResponse.json(
      { error: "Voice calling isn't configured yet." },
      { status: 503 },
    );
  }
  return null;
}

/** Twilio accepts either an API key pair or the account auth token. */
function getClients() {
  const c = twilioConfig();
  const clients = [];
  if (c.apiKeySid && c.apiKeySecret) {
    clients.push({
      label: "api-key",
      client: twilio(c.apiKeySid, c.apiKeySecret, { accountSid: c.accountSid! }),
    });
  }
  if (c.authToken) {
    clients.push({
      label: "auth-token",
      client: twilio(c.accountSid!, c.authToken),
    });
  }
  return clients;
}

type TwilioLike = ReturnType<typeof getClients>[number]["client"];

/**
 * Run a Twilio call, falling back to the account auth token when the API key
 * pair is rejected, and translate auth/account failures into a message the
 * listener can act on instead of a raw Twilio error code.
 */
async function withTwilio<T>(
  run: (client: TwilioLike) => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; status: number; error: string }> {
  const clients = getClients();
  if (clients.length === 0) {
    return {
      ok: false,
      status: 503,
      error: "Voice calling isn't configured yet.",
    };
  }

  let lastCode: number | undefined;
  for (const { client } of clients) {
    try {
      return { ok: true, value: await run(client) };
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err
        ? Number((err as { code?: unknown }).code)
        : undefined;
      lastCode = code;
      console.error("Twilio call failed:", err);
      if (code && [20003, 70051, 20404].includes(code)) continue; // try next credential
      break;
    }
  }

  // 20003 = auth token rejected, 70051 = API key rejected, 20404 = account not
  // found / closed. All three mean the Twilio account needs client action.
  if (lastCode && [20003, 70051, 20404].includes(lastCode)) {
    return {
      ok: false,
      status: 503,
      error:
        "Voice calling is unavailable — the Twilio account needs to be reactivated (contact support@ourearsareopen.com). You can still chat here.",
    };
  }
  return {
    ok: false,
    status: 502,
    error: "We couldn't place the call just now. Please try again in a moment.",
  };
}

async function loadSession(sessionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("sessions")
    .select("id, user_id, listener_id, mode, status, room_id")
    .eq("id", sessionId)
    .maybeSingle();
  return { admin, session: data as SessionRow | null };
}

/**
 * POST /api/twilio/call — listener dials the consumer.
 *
 * Voice is a PSTN bridge, not an in-browser call: the Twilio number calls the
 * consumer, then bridges to the listener's own phone. That matches the product
 * rule that only the team member places the call, and it needs no TwiML app or
 * browser SDK. The created Call SID is stored on `sessions.room_id` so the
 * call can be hung up from the session room.
 */
export async function POST(req: NextRequest) {
  const unavailable = voiceUnavailable();
  if (unavailable) return unavailable;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string | null = null;
  try {
    const body = await req.json();
    sessionId = typeof body.session_id === "string" ? body.session_id : null;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  const { admin, session } = await loadSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.mode !== "phone") {
    return NextResponse.json(
      { error: "This session isn't a phone conversation." },
      { status: 409 },
    );
  }
  if (session.listener_id !== user.id) {
    return NextResponse.json(
      { error: "Only the assigned listener can place the call." },
      { status: 403 },
    );
  }
  if (session.status === "ended" || session.status === "completed") {
    return NextResponse.json(
      { error: "This session has already finished." },
      { status: 409 },
    );
  }

  const { data: listener } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  const { data: consumer } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", session.user_id)
    .maybeSingle();

  if (!consumer?.phone) {
    return NextResponse.json(
      {
        error:
          "The consumer has no phone number on file. Ask them to add one in their profile.",
      },
      { status: 409 },
    );
  }
  if (!listener?.phone) {
    return NextResponse.json(
      { error: "Add your own phone number in your profile to place calls." },
      { status: 409 },
    );
  }

  const from = twilioConfig().from!;
  const twiml = `<Response>
  <Say voice="alice">Connecting you with your listener now.</Say>
  <Dial callerId="${from}" timeout="30" record="false">
    <Number>${listener.phone}</Number>
  </Dial>
</Response>`;

  const consumerPhone = consumer.phone as string;
  const placed = await withTwilio((client) =>
    client.calls.create({ to: consumerPhone, from, twiml }),
  );

  if (!placed.ok) {
    return NextResponse.json(
      { error: placed.error },
      { status: placed.status },
    );
  }

  const call = placed.value;
  await admin
    .from("sessions")
    .update({ room_id: call.sid })
    .eq("id", session.id);

  return NextResponse.json({
    ok: true,
    call_sid: call.sid,
    status: call.status,
    dialing: consumerPhone,
  });
}

/**
 * DELETE /api/twilio/call — listener hangs up an in-progress call.
 */
export async function DELETE(req: NextRequest) {
  const unavailable = voiceUnavailable();
  if (unavailable) return unavailable;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string | null = null;
  try {
    const body = await req.json();
    sessionId = typeof body.session_id === "string" ? body.session_id : null;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  const { session } = await loadSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.listener_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!session.room_id?.startsWith("CA")) {
    return NextResponse.json(
      { error: "There's no active call to hang up." },
      { status: 409 },
    );
  }

  const hung = await withTwilio((client) =>
    client.calls(session.room_id!).update({ status: "completed" }),
  );

  if (!hung.ok) {
    return NextResponse.json({ error: hung.error }, { status: hung.status });
  }

  return NextResponse.json({ ok: true, status: hung.value.status });
}
