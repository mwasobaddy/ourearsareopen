"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Loader2,
  MessageSquare,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type QueuedRow = Database["public"]["Tables"]["queue_entries"]["Row"];

type Props = {
  paymentId: string;
  listenersAvailable?: number;
};

// Rough average chat-session length in minutes used to estimate how long a
// single slot (one position) takes. Conservative by design.
const AVG_SESSION_MINUTES = 15;

function estimateWaitMinutes(position: number, listeners: number): string {
  if (position <= 1) return "about 1 minute";
  const capacity = Math.max(listeners, 1);
  const minutes = Math.ceil(position / capacity) * AVG_SESSION_MINUTES;
  if (minutes < 60) return `about ${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `about ${hours}h ${rem}m` : `about ${hours} hours`;
}

export function QueueStatus({ paymentId, listenersAvailable = 1 }: Props) {
  const supabase = createClient();
  const [entry, setEntry] = useState<QueuedRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [leftQueue, setLeftQueue] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function join() {
      // Guard against double-join from React StrictMode double-mount.
      if (joinedRef.current) return;
      joinedRef.current = true;

      // Try to restore an in-progress entry first, then join fresh.
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        toast.error("Please log in to join the queue.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/queue/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_id: paymentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Couldn't join the queue.");
        }
        if (!cancelled) {
          setEntry(data.entry);
          setLoading(false);
        }

        // Live updates: position decrements, or we get assigned a listener.
        const channel = supabase
          .channel(`queue-${data.entry.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "queue_entries",
              filter: `user_id=eq.${uid}`,
            },
            (payload) => {
              setEntry(payload.new as QueuedRow);
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Couldn't join the queue.";
          toast.error(message);
          setLoading(false);
        }
      }
    }

    join();
    return () => {
      cancelled = true;
    };
  }, [paymentId, supabase]);

  async function handleLeave() {
    setLeaving(true);
    try {
      const res = await fetch("/api/queue/leave", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Couldn't leave the queue right now.");
        return;
      }
      setEntry(null);
      setLeftQueue(true);
    } catch {
      toast.error("Couldn't leave the queue right now.");
    } finally {
      setLeaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Joining the queue…
        </CardContent>
      </Card>
    );
  }

  if (leftQueue) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <XCircle className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-xl font-bold text-foreground">You left the queue</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            You can join again anytime. If you faced any issues, we&apos;re here
            to help.
          </p>
          <a href="/chat-queue" className="mt-2">
            <Button variant="outline">Back to Queue</Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  if (!entry) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            We couldn&apos;t join the queue right now. Please try again.
          </p>
          <Button asChild className="mt-4">
            <a href="/chat-queue">Back to Queue</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = entry.status;

  return (
    <Card
      className={
        status === "assigned"
          ? "border-primary/40 bg-primary/5"
          : "border-border"
      }
    >
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {status === "assigned" ? (
            <CheckCircle className="h-8 w-8" />
          ) : (
            <MessageSquare className="h-8 w-8" />
          )}
        </div>

        {status === "assigned" ? (
          <>
            <h3 className="text-2xl font-bold text-foreground">
              You&apos;ve been matched!
            </h3>
            <p className="max-w-md text-muted-foreground">
              A listener is available. Open the chat to start your
              conversation.
            </p>
            <Button asChild className="mt-2">
              <a
                href={`/session/${entry.id}?origin=queue`}
                className="inline-flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Open Chat
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={handleLeave}
              disabled={leaving}
            >
              {leaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Leave queue
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-foreground">
              You&apos;re in the Queue
            </h3>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              {entry.position != null && entry.position > 0
                ? `You are #${entry.position} in line.`
                : "You're next in line."}
            </p>
            <p className="text-sm text-muted-foreground">
              Estimated wait:{" "}
              <span className="font-medium text-foreground">
                {estimateWaitMinutes(
                  entry.position ?? 1,
                  listenersAvailable,
                )}
              </span>
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              A listener will be matched to you as soon as one is available.
              Keep this page open — we&apos;ll update you in real time.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={handleLeave}
              disabled={leaving}
            >
              {leaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Leave queue
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
