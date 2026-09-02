"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type TemplateRow = {
  key: string;
  subject: string;
  body: string;
  description: string | null;
};

const PLACEHOLDER_HINT =
  "Available placeholders: {{ org_name }}, {{ first_name }}, {{ listener_name }}, {{ slot_start }}, {{ type }}, {{ amount }}";

export function EmailTemplatesEditor({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(key);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/super-admin/email-templates/${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.get("subject"),
          body: form.get("body"),
          description: form.get("description") || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't save the template.");
        return;
      }
      toast.success("Template saved");
      router.refresh();
    } catch {
      toast.error("Couldn't save the template.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{PLACEHOLDER_HINT}</p>
      <p className="text-sm text-muted-foreground">
        Templates are stored here for future use. Actual sending is wired to
        Resend once the client provides API credentials (see the launch
        checklist) — until then emails are not delivered.
      </p>

      <div className="space-y-4">
        {templates.map((t) => (
          <form
            key={t.key}
            onSubmit={(e) => save(t.key, e)}
            className="rounded-lg border border-border bg-background p-4"
          >
            <h3 className="mb-1 font-medium">{t.key}</h3>
            {t.description && (
              <p className="mb-3 text-xs text-muted-foreground">{t.description}</p>
            )}
            <div className="grid gap-3">
              <div>
                <Label htmlFor={`t-subject-${t.key}`}>Subject</Label>
                <Input id={`t-subject-${t.key}`} name="subject" defaultValue={t.subject} required />
              </div>
              <div>
                <Label htmlFor={`t-body-${t.key}`}>Body</Label>
                <Textarea
                  id={`t-body-${t.key}`}
                  name="body"
                  defaultValue={t.body}
                  rows={5}
                  required
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="submit" size="sm" disabled={saving === t.key}>
                {saving === t.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
