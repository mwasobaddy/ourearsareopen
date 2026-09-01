"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ToggleActiveButton({
  profileId,
  isActive,
  name,
}: {
  profileId: string;
  isActive: boolean;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (
      !window.confirm(
        isActive
          ? `Deactivate ${name}? They will no longer be counted as active.`
          : `Reactivate ${name}?`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/profiles/${profileId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !isActive }),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Couldn't update.");
        return;
      }
      toast.success(isActive ? "Deactivated" : "Reactivated");
      router.refresh();
    } catch {
      toast.error("Couldn't update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={isActive ? "destructive" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isActive ? "Deactivate" : "Reactivate"}
    </Button>
  );
}

export function AddListenerForm({
  requiresAuthUser,
}: {
  requiresAuthUser: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/listeners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.get("full_name"),
          email: form.get("email"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't create the listener.");
        return;
      }
      toast.success("Listener created");
      if (data.note && requiresAuthUser) {
        toast.info(data.note, { duration: 8000 });
      }
      router.push("/admin/listeners");
    } catch {
      toast.error("Couldn't create the listener.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" placeholder="Jordan Lee" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jordan@example.com"
        />
        <p className="text-xs text-muted-foreground">
          Providing an email creates a sign-in account (password auth + email
          are configured by the client in Supabase).
        </p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create listener
      </Button>
    </form>
  );
}
