"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkNoShowButton({
  bookingId,
  variant = "outline",
  onDone,
}: {
  bookingId: string;
  variant?: "outline" | "ghost";
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleMarkNoShow() {
    if (!window.confirm("Mark this appointment as a no-show?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/no-show`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Couldn't mark as no-show.");
        return;
      }
      toast.success("Marked as no-show.");
      window.location.reload();
      onDone?.();
    } catch {
      toast.error("Couldn't mark as no-show.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={handleMarkNoShow} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserX className="mr-2 h-4 w-4" />
      )}
      No-show
    </Button>
  );
}