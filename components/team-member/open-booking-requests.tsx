"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Inbox,
  CalendarClock,
  UserPlus,
  MessageSquare,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OpenRequest = {
  id: string;
  type: "phone" | "chat";
  concern: string | null;
  slot_start: string | null;
  payment_option: string;
  created_at: string;
  customer: {
    full_name?: string | null;
    reason?: string | null;
    age_range?: string | null;
    pronouns?: string | null;
  } | null;
};

export function OpenBookingRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<OpenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [justAccepted, setJustAccepted] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings/open");
      const data = await res.json();
      if (!res.ok) {
        setRequests([]);
        return;
      }
      setRequests(data.requests ?? []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // New requests appear without a manual refresh.
    const poll = setInterval(load, 30_000);
    return () => clearInterval(poll);
  }, [load]);

  async function handleAccept(id: string) {
    setAcceptingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't accept that conversation.");
        load();
        return;
      }
      setJustAccepted((prev) => [...prev, id]);
      toast.success("Conversation accepted — the customer has been notified.");
      load();
      // The "Upcoming" list is server-rendered, so refresh it too.
      router.refresh();
    } catch {
      toast.error("Couldn't accept that conversation.");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Open Requests
          <Badge variant="secondary" className="ml-auto">
            {requests.length} waiting
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading requests…
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Inbox className="mx-auto mb-4 h-16 w-16 opacity-50" />
            <p className="text-lg font-medium">No open requests</p>
            <p className="mt-1 text-sm">
              When a customer books a conversation, it appears here for the
              first listener to accept.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const accepted = justAccepted.includes(r.id);
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {r.type === "phone" ? (
                        <Phone className="h-6 w-6 text-primary" />
                      ) : (
                        <MessageSquare className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {r.customer?.full_name ?? "Consumer"}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {[
                            r.customer?.pronouns,
                            r.customer?.age_range,
                            r.payment_option === "free" ? "free" : "paid",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </p>
                      {r.concern ? (
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                          {r.concern}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          No details shared.
                        </p>
                      )}
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {r.slot_start
                          ? new Date(r.slot_start).toLocaleString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "Time to be confirmed"}
                      </p>
                    </div>
                  </div>
                  {accepted ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/session/${r.id}?origin=booking`}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Open room
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(r.id)}
                      disabled={acceptingId === r.id}
                    >
                      {acceptingId === r.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
