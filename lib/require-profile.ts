import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guard that redirects unauthenticated users to /login and
 * users with an incomplete profile to /profile/setup (preserving the
 * intended destination via the `next` param so they can return after
 * finishing setup). Returns the authenticated, profile-complete user.
 */
export async function requireCompleteProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.profile_complete) {
    redirect("/profile/setup");
  }

  return { supabase, user, profile };
}
