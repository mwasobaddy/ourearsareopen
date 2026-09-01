import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FeatureFlagsForm,
  type FlagRow,
} from "@/components/super-admin/feature-flags-form";

export const metadata: Metadata = {
  title: "Feature Flags | Super Admin | Our Ears Are Open",
  description: "Manage platform feature flags.",
};

export default async function SuperAdminFeaturesPage() {
  await requireSuperAdmin();

  const admin = createAdminClient();
  const { data } = await admin
    .from("feature_flags")
    .select("key, enabled, description")
    .order("key", { ascending: true });

  const flags: FlagRow[] = (data ?? []).map((f) => ({
    key: f.key,
    enabled: f.enabled,
    description: f.description,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-muted-foreground">
          Enable or disable platform-wide features. Changes take effect
          immediately on the relevant flows (queue, donations, booking).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureFlagsForm flags={flags} />
        </CardContent>
      </Card>
    </div>
  );
}
