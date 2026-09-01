"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type FlagRow = {
  key: string;
  enabled: boolean;
  description: string | null;
};

export function FeatureFlagsForm({ flags }: { flags: FlagRow[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(flags.map((f) => [f.key, f.enabled])),
  );
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/feature-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't save feature flags.");
        return;
      }
      toast.success("Feature flags saved");
      router.refresh();
    } catch {
      toast.error("Couldn't save feature flags.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {flags.map((f) => (
        <div
          key={f.key}
          className="flex items-center justify-between rounded-lg border border-border p-4"
        >
          <div>
            <Label htmlFor={`flag-${f.key}`} className="text-base font-medium">
              {f.key.replace(/_/g, " ")}
            </Label>
            {f.description && (
              <p className="text-sm text-muted-foreground">{f.description}</p>
            )}
          </div>
          <Switch
            id={`flag-${f.key}`}
            checked={values[f.key] ?? false}
            onCheckedChange={(v) =>
              setValues((prev) => ({ ...prev, [f.key]: v }))
            }
          />
        </div>
      ))}
      <Button onClick={save} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save feature flags
      </Button>
    </div>
  );
}
