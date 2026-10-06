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

export function BookingListenerAssign({
  bookingId,
  currentListenerId,
  currentListenerName,
  listeners,
  disabled,
}: {
  bookingId: string;
  currentListenerId: string | null;
  currentListenerName: string | null;
  listeners: ListenerOption[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(currentListenerId ?? "none");
  const [loading, setLoading] = useState(false);

  async function save() {
    const listenerId = selected === "none" ? null : selected;
    if (listenerId === currentListenerId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, listenerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't update the listener.");
        return;
      }
      toast.success(
        listenerId ? "Listener assigned" : "Listener cleared",
      );
      router.refresh();
    } catch {
      toast.error("Couldn't update the listener.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentListenerId && (
        <span className="text-sm text-muted-foreground">
          {currentListenerName ?? "Listener"}
        </span>
      )}
      <Select
        value={selected}
        onValueChange={setSelected}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-52" aria-label="Assign a listener">
          <SelectValue placeholder="Assign listener" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— Unassigned —</SelectItem>
          {listeners.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.full_name ?? "Listener"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={save}
        disabled={loading || disabled || selected === (currentListenerId ?? "none")}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save
      </Button>
    </div>
  );
}
