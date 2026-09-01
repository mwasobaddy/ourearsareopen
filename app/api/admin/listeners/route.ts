import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, ADMIN_UNAUTHORIZED } from "@/lib/api-admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
});

/**
 * Admin-only: create a listener account. Creates the auth user (email invite;
 * password auth + email are client-configured) and the profiles row with role
 * `listener`.
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
  const email = parsed.email || null;

  let authUser;
  if (email) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: parsed.full_name },
    });
    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Couldn't create the listener." },
        { status: 400 },
      );
    }
    authUser = data.user;
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: authUser ? authUser.id : crypto.randomUUID(),
      email: email ?? parsed.full_name,
      full_name: parsed.full_name,
      role: "listener",
      is_active: true,
    })
    .select("id, full_name, email, role, is_active")
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Listener account created, but profile save failed." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      listener: profile,
      note: email
        ? "Auth user created. Sign-in password/email flow is managed by Supabase (client must enable password auth + email)."
        : "No email provided — add an auth user later via the Users/Listeners area.",
    },
    { status: 201 },
  );
}
