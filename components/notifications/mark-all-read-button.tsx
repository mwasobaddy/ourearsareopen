"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);

  async function handleMarkAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) {
        toast.error("Couldn't mark notifications as read.");
        return;
      }
      toast.success("All notifications marked as read.");
      window.location.reload();
    } catch {
      toast.error("Couldn't mark notifications as read.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCheck className="mr-2 h-4 w-4" />
      )}
      Mark all read
    </Button>
  );
}