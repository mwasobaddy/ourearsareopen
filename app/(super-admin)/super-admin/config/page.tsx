import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { getOrgConfig } from "@/lib/super-admin-data";
import { OrgConfigForm } from "@/components/super-admin/org-config-form";

export const metadata: Metadata = {
  title: "Org Config | Super Admin | Our Ears Are Open",
  description: "Organisation and tenant configuration.",
};

type CrisisLink = { label: string; url: string };

export default async function SuperAdminConfigPage() {
  await requireSuperAdmin();
  const config = await getOrgConfig();

  const crisisLinks = Array.isArray(config?.crisis_links)
    ? (config.crisis_links as CrisisLink[])
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisation Config</h1>
        <p className="text-muted-foreground">
          Global platform settings and branding. These values are read across the
          site (name, logo, support email, crisis links, timezone).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          {config ? (
            <OrgConfigForm
              orgName={config.org_name}
              logoUrl={config.logo_url}
              supportEmail={config.support_email}
              timezone={config.timezone}
              crisisLinks={crisisLinks}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No org config row found. Re-run the seed (migration 0015) to create one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
