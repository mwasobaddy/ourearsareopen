"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type RoomRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

const ICONS = [
  "trophy",
  "messages-square",
  "brain",
  "heart",
  "users",
  "cloud-rain",
  "trending-up",
  "rainbow",
  "smile",
  "star",
];

export function RoomEditor({ rooms }: { rooms: RoomRow[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function save(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/admin/content/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.get("slug"),
          title: form.get("title"),
          description: form.get("description") || null,
          icon: form.get("icon"),
          sort_order: Number(form.get("sort_order") || 0),
          is_active: form.get("is_active") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't save room.");
        return;
      }
      toast.success("Room saved");
      router.refresh();
    } catch {
      toast.error("Couldn't save room.");
    } finally {
      setSaving(false);
    }
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/content/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.get("slug"),
          title: form.get("title"),
          description: form.get("description") || null,
          icon: form.get("icon"),
          sort_order: rooms.length * 10 + 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't create room.");
        return;
      }
      toast.success("Room created");
      setCreating(false);
      router.refresh();
    } catch {
      toast.error("Couldn't create room.");
      setCreating(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/content/rooms/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't delete room.");
        return;
      }
      toast.success("Room deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete room.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rooms.map((room) => (
          <form
            key={room.id}
            onSubmit={(e) => save(room.id, e)}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`r-slug-${room.id}`}>Slug</Label>
                <Input id={`r-slug-${room.id}`} name="slug" defaultValue={room.slug} />
              </div>
              <div>
                <Label htmlFor={`r-title-${room.id}`}>Title</Label>
                <Input id={`r-title-${room.id}`} name="title" defaultValue={room.title} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`r-desc-${room.id}`}>Description</Label>
                <Textarea id={`r-desc-${room.id}`} name="description" defaultValue={room.description ?? ""} />
              </div>
              <div>
                <Label htmlFor={`r-icon-${room.id}`}>Icon</Label>
                <select
                  id={`r-icon-${room.id}`}
                  name="icon"
                  defaultValue={room.icon}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ICONS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor={`r-order-${room.id}`}>Sort order</Label>
                <Input
                  id={`r-order-${room.id}`}
                  name="sort_order"
                  type="number"
                  defaultValue={room.sort_order}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={room.is_active}
                  className="h-4 w-4 accent-primary"
                />
                Active
              </label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => remove(room.id)}
                  disabled={deleting === room.id}
                >
                  {deleting === room.id ? (
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
          <Plus className="h-4 w-4" /> Add a room
        </h3>
        {creating ? (
          <form onSubmit={create} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-slug">Slug</Label>
                <Input id="new-slug" name="slug" placeholder="e.g. hobbies" required />
              </div>
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input id="new-title" name="title" placeholder="e.g. Hobbies" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="new-desc">Description</Label>
                <Textarea id="new-desc" name="description" placeholder="Room description" />
              </div>
              <div>
                <Label htmlFor="new-icon">Icon</Label>
                <select id="new-icon" name="icon" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {ICONS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create room
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New room
          </Button>
        )}
      </div>
    </div>
  );
}
