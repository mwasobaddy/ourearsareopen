import type { Metadata } from "next";
import { FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Content | Admin — Our Ears Are Open",
  description: "Edit community rooms and site content.",
};

export default async function AdminContentPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Content</h1>
      <p className="text-muted-foreground">
        Edit community room titles/descriptions and site-wide copy.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Community rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The community-rooms feature is not part of the current build (the
            platform is focused on 1:1 listening sessions, queue, and payments).
            Editable site-wide content (org name, logo, support/crisis links,
            timezone, feature flags) is delivered in{" "}
            <strong>Module 10 (Super Admin)</strong> via the org_config editor.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Marketing & legal copy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Terms, Privacy, and Cancellation Policy page copy are managed in the
            client checklist (Module 11 — Content & Marketing templates).
          </p>
        </CardContent>
      </Card>
    </>
  );
}
