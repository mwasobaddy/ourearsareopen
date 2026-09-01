"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CrisisLink = { label: string; url: string };

export function OrgConfigForm({
  orgName,
  logoUrl,
  supportEmail,
  timezone,
  crisisLinks,
}: {
  orgName: string;
  logoUrl: string | null;
  supportEmail: string | null;
  timezone: string;
  crisisLinks: CrisisLink[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let crisisLinksParsed: CrisisLink[] | null = null;
    const rawCrisis = String(form.get("crisis_links") ?? "");
    try {
      const parsed = JSON.parse(rawCrisis || "[]");
      if (!Array.isArray(parsed)) throw new Error();
      crisisLinksParsed = parsed;
    } catch {
      toast.error("Crisis links must be a JSON array, e.g. [{\"label\":\"...\",\"url\":\"...\"}]");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/org-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: form.get("org_name"),
          logo_url: (form.get("logo_url") as string) || null,
          support_email: (form.get("support_email") as string) || null,
          timezone: form.get("timezone"),
          crisis_links: crisisLinksParsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't save config.");
        return;
      }
      toast.success("Org config saved");
      router.refresh();
    } catch {
      toast.error("Couldn't save config.");
    } finally {
      setLoading(false);
    }
  }

  const crisisText = JSON.stringify(crisisLinks, null, 2);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="org_name">Organisation Name</Label>
          <Input id="org_name" name="org_name" defaultValue={orgName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_email">Support Email</Label>
          <Input id="support_email" name="support_email" type="email" defaultValue={supportEmail ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input id="logo_url" name="logo_url" placeholder="https://..." defaultValue={logoUrl ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" name="timezone" defaultValue={timezone} placeholder="America/New_York" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="crisis_links">Crisis / support links (JSON)</Label>
        <Textarea
          id="crisis_links"
          name="crisis_links"
          rows={5}
          defaultValue={crisisText}
          placeholder='[{"label":"988 Suicide & Crisis Lifeline","url":"https://988lifeline.org"}]'
        />
        <p className="text-xs text-muted-foreground">
          Array of objects with label + url. Shown on public crisis/support elements.
        </p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
