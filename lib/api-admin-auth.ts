import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminSession = {
  userId: string;
  role: "admin" | "super_admin";
};

/**
 * Authenticates + verifies admin (or super_admin) for API route handlers.
 * Returns the current user's id + role, or null when not permitted.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
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
  if (
    !profile ||
    !profile.is_active ||
    (profile.role !== "admin" && profile.role !== "super_admin")
  ) {
    return null;
  }
  return { userId: user.id, role: profile.role };
}

export const ADMIN_UNAUTHORIZED = { error: "Unauthorized" };
export const ADMIN_FORBIDDEN = { error: "Admin access required." };
