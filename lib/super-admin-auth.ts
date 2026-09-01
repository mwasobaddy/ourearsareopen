import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SuperAdminUser = {
  id: string;
  role: "super_admin";
};

/**
 * Server-component guard for /super-admin routes.
 * Redirects unauthenticated users to /login and non-super-admins to /.
 * Returns the current super-admin user id.
 */
export async function requireSuperAdmin(): Promise<SuperAdminUser> {
  const userClient = await createClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !profile.is_active ||
    profile.role !== "super_admin"
  ) {
    redirect("/");
  }

  return { id: user.id, role: "super_admin" };
}

/**
 * Authenticates + verifies super_admin for API route handlers.
 * Returns the current user's id, or null when not permitted.
 */
export async function getSuperAdminSession(): Promise<{ userId: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !profile.is_active || profile.role !== "super_admin") {
    return null;
  }
  return { userId: user.id };
}

export const SUPER_ADMIN_UNAUTHORIZED = { error: "Unauthorized" };
export const SUPER_ADMIN_FORBIDDEN = { error: "Super admin access required." };
