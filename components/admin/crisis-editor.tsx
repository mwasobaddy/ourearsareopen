"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CrisisRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  availability: string | null;
  is_primary: boolean;
  is_active: boolean;
  sort_order: number;
};

export function CrisisEditor({ links }: { links: CrisisRow[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function save(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/admin/content/crisis/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description") || null,
          phone: form.get("phone") || null,
          availability: form.get("availability") || null,
          is_primary: form.get("is_primary") === "on",
          is_active: form.get("is_active") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't save resource.");
        return;
      }
      toast.success("Resource saved");
      router.refresh();
    } catch {
      toast.error("Couldn't save resource.");
    } finally {
      setSaving(false);
    }
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/content/crisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description") || null,
          phone: form.get("phone") || null,
          availability: form.get("availability") || null,
          is_primary: Boolean(form.get("is_primary")),
          sort_order: links.length * 10 + 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't create resource.");
        return;
      }
      toast.success("Resource created");
      setCreating(false);
      router.refresh();
    } catch {
      toast.error("Couldn't create resource.");
      setCreating(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/content/crisis/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't delete resource.");
        return;
      }
      toast.success("Resource deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete resource.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {links.map((link) => (
          <form
            key={link.id}
            onSubmit={(e) => save(link.id, e)}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor={`c-name-${link.id}`}>Name</Label>
                <Input id={`c-name-${link.id}`} name="name" defaultValue={link.name} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`c-desc-${link.id}`}>Description</Label>
                <Textarea id={`c-desc-${link.id}`} name="description" defaultValue={link.description ?? ""} />
              </div>
              <div>
                <Label htmlFor={`c-phone-${link.id}`}>Phone</Label>
                <Input id={`c-phone-${link.id}`} name="phone" defaultValue={link.phone ?? ""} />
              </div>
              <div>
                <Label htmlFor={`c-avail-${link.id}`}>Availability</Label>
                <Input id={`c-avail-${link.id}`} name="availability" defaultValue={link.availability ?? ""} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_primary" defaultChecked={link.is_primary} className="h-4 w-4 accent-primary" />
                  Primary
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked={link.is_active} className="h-4 w-4 accent-primary" />
                  Active
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => remove(link.id)}
                  disabled={deleting === link.id}
                >
                  {deleting === link.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          </form>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" /> Add a crisis resource
        </h3>
        {creating ? (
          <form onSubmit={create} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-name">Name</Label>
                <Input id="new-name" name="name" placeholder="Resource name" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="new-desc">Description</Label>
                <Textarea id="new-desc" name="description" placeholder="Description" />
              </div>
              <div>
                <Label htmlFor="new-phone">Phone</Label>
                <Input id="new-phone" name="phone" placeholder="e.g. 988" />
              </div>
              <div>
                <Label htmlFor="new-avail">Availability</Label>
                <Input id="new-avail" name="availability" placeholder="e.g. 24/7" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create resource
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New resource
          </Button>
        )}
      </div>
    </div>
  );
}
