"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ListenerOption = { id: string; full_name: string | null };

export function AssignedListenerControl({
  customerId,
  currentListenerId,
  listeners,
  currentListenerName,
}: {
  customerId: string;
  currentListenerId: string | null;
  listeners: ListenerOption[];
  currentListenerName: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(
    currentListenerId ?? "none",
  );
  const [loading, setLoading] = useState(false);

  async function assign() {
    const listenerId = selected === "none" ? null : selected;
    if (listenerId === currentListenerId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/assigned-listener`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customerId, listenerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't update the assigned listener.");
        return;
      }
      toast.success(
        listenerId ? "Listener assigned" : "Assigned listener cleared",
      );
      router.refresh();
    } catch {
      toast.error("Couldn't update the assigned listener.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {currentListenerId ? (
        <p className="text-sm">
          Assigned to{" "}
          <span className="font-medium">
            {currentListenerName ?? "Listener"}
          </span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No listener assigned.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— None (clear) —</SelectItem>
            {listeners.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.full_name ?? "Listener"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="default"
          size="sm"
          onClick={assign}
          disabled={loading || selected === (currentListenerId ?? "none")}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}