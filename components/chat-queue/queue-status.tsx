"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type QueuedRow = Database["public"]["Tables"]["queue_entries"]["Row"];

type Props = {
  paymentId: string;
};

export function QueueStatus({ paymentId }: Props) {
  const supabase = createClient();
  const [entry, setEntry] = useState<QueuedRow | null>(null);
  const [loading, setLoading] = useState(true);
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
            <p className="max-w-md text-sm text-muted-foreground">
              A listener will be matched to you as soon as one is available.
              Keep this page open — we&apos;ll update you in real time.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
