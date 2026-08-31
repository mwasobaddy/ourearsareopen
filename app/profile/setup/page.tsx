import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import {
  ProfileSetupWizard,
  type ProfileFormValues,
} from "@/components/profile/profile-setup-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Complete Your Profile | Our Ears Are Open",
  description:
    "Tell us a little about yourself so we can match you with the right team member.",
};

export default async function ProfileSetupPage() {
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
      "full_name, pronouns, age_range, country, gender_identity, sexual_orientation, relationship_status, religion_importance, spiritual, prior_therapy, reason, services_consent, avatar_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  const initial: ProfileFormValues = {
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
    pronouns: profile?.pronouns ?? "",
    age_range: profile?.age_range ?? "",
    country: profile?.country ?? "",
    gender_identity: profile?.gender_identity ?? "",
    sexual_orientation: profile?.sexual_orientation ?? "",
    relationship_status: profile?.relationship_status ?? "",
    religion_importance: profile?.religion_importance ?? "",
    spiritual: profile?.spiritual ?? "",
    prior_therapy: profile?.prior_therapy ?? "",
    reason: profile?.reason ?? "",
    services_consent: profile?.services_consent ?? false,
    avatar_url: profile?.avatar_url ?? null,
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo href={undefined} variant="compact" className="[&>img]:h-12" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Complete Your Profile
            </h1>
            <p className="mt-3 text-muted-foreground">
              Help us understand you better so we can match you with the right
              team member. All information is confidential.
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">Your profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                This helps us connect you with a team member who is the best fit
                for you. You can update this at any time from your profile.
              </p>
            </CardHeader>
            <CardContent>
              <ProfileSetupWizard initial={initial} userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
