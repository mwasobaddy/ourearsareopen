"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ROLES = ["customer", "listener", "admin", "super_admin"] as const;
type Role = (typeof ROLES)[number];

export function ChangeRoleSelect({
  profileId,
  currentRole,
  isSelf,
}: {
  profileId: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (role === currentRole) return;
    if (isSelf) {
      toast.error("You cannot change your own role.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/users/${profileId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't change role.");
        return;
      }
      toast.success("Role updated");
      router.refresh();
    } catch {
      toast.error("Couldn't change role.");
    } finally {
      setLoading(false);
    }
  }

  const changed = role !== currentRole;

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        disabled={isSelf}
        className="h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:opacity-50"
        aria-label="Role"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={submit} disabled={!changed || loading || isSelf}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {changed ? "Save" : "Saved"}
      </Button>
    </div>
  );
}
