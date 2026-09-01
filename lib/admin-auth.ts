import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUser = {
  id: string;
  role: "admin" | "super_admin";
};

/**
 * Server-component guard for /admin routes.
 * Redirects unauthenticated users to /login and non-admins to /.
 * Returns the current user id.
 */
export async function requireAdmin(): Promise<AdminUser> {
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
    (profile.role !== "admin" && profile.role !== "super_admin")
  ) {
    redirect("/");
  }

  return { id: user.id, role: profile.role };
}
