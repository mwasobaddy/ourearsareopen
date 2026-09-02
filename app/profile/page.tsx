import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileView, type ProfileData } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "My Profile | Our Ears Are Open",
  description:
    "Manage your Our Ears Are Open profile, view your conversation history, and update your settings.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, avatar_url, phone, pronouns, age_range, country, gender_identity, sexual_orientation, relationship_status, religion_importance, spiritual, prior_therapy, reason, assigned_listener_id, profile_complete, created_at",
    )
    .eq("id", user.id)
    .single();

  let assignedListenerName: string | null = null;
  if (profile?.assigned_listener_id) {
    const admin = createAdminClient();
    const { data: al } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", profile.assigned_listener_id)
      .maybeSingle();
    assignedListenerName = al?.full_name ?? null;
  }

  const data: ProfileData = profile ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: null,
    phone: null,
    pronouns: null,
    age_range: null,
    country: null,
    gender_identity: null,
    sexual_orientation: null,
    relationship_status: null,
    religion_importance: null,
    spiritual: null,
    prior_therapy: null,
    reason: null,
    assigned_listener_id: null,
    profile_complete: false,
    created_at: user.created_at ?? null,
  };

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <ProfileView profile={data} assignedListenerName={assignedListenerName} />
      </div>
    </section>
  );
}
