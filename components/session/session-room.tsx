"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  Phone,
  MessageSquare,
  UserPlus,
  UserMinus,
  LogOut,
  StickyNote,
  CheckCircle2,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

const SESSION_MS = 15 * 60_000;
const EXTEND_MS = 5 * 60_000;
const WARN_MS = 60_000;

const END_REASONS = [
  "Consumer became distressed",
  "Abusive or inappropriate language",
  "Consumer requested to end",
  "Listener felt unsafe",
  "Technical issue",
  "Session naturally ended",
  "Other",
];

type Props = {
  origin: "queue" | "booking";
  refId: string;
};

type UiMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  kind: "message" | "system";
};

export function SessionRoom({ origin, refId }: Props) {
  const supabase = createClient();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [extensionMs, setExtensionMs] = useState(0);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endReason, setEndReason] = useState("");
  const [endDetails, setEndDetails] = useState("");
  const autoEndRef = useRef(false);
  const endingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const joinedRef = useRef(false);
  const channelRef = useRef<
    (ReturnType<typeof supabase.channel> | undefined)[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    let msgChannel: ReturnType<typeof supabase.channel> | undefined;
    let statusChannel: ReturnType<typeof supabase.channel> | undefined;

    async function open() {
      if (joinedRef.current) return;
      joinedRef.current = true;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to join the session.");
        setLoading(false);
        return;
      }
      setUid(user.id);

      let res: Response;
      try {
        res = await fetch("/api/session/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            origin === "queue"
              ? { queue_entry_id: refId }
              : { booking_id: refId },
          ),
        });
      } catch {
        if (!cancelled) {
          toast.error("Couldn't open the session.");
          setLoading(false);
        }
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (!cancelled) {
          toast.error(data.error || "Couldn't open the session.");
          setLoading(false);
        }
        return;
      }

      const sess = data.session as SessionRow;
      if (cancelled) return;
      setSession(sess);
      setNotes(sess.notes ?? "");
      setLoading(false);

      // Load message history.
      const { data: history } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sess.id)
        .order("created_at", { ascending: true });
      if (!cancelled && history) {
        setMessages(
          history.map((m) => ({ ...m, kind: "message" as const })),
        );
      }

      // Live messages.
      const msgChannel = supabase
        .channel(`session-msgs-${sess.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `session_id=eq.${sess.id}`,
          },
          (payload) => {
            const row = payload.new as MessageRow;
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, { ...row, kind: "message" as const }];
            });
            if (row.sender_id === user.id) {
              setDraft("");
            }
          },
        )
        .subscribe();

      // Live session status (joined/left/ended).
      const statusChannel = supabase
        .channel(`session-status-${sess.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "sessions",
            filter: `id=eq.${sess.id}`,
          },
          (payload) => {
            const next = payload.new as SessionRow;
            const prev = payload.old as SessionRow;
            setSession(next);
            if (prev?.status === "active" && next.status === "left") {
              setMessages((m) => [
                ...m,
                {
                  id: `sys-left-${Date.now()}`,
                  sender_id: "system",
                  body:
                    next.listener_id === user.id
                      ? "You left the session."
                      : "The other participant left. They can rejoin anytime.",
                  created_at: new Date().toISOString(),
                  kind: "system",
                },
              ]);
            }
          },
        )
        .subscribe();

      channelRef.current.push(msgChannel, statusChannel);
    }

    open();
    return () => {
      cancelled = true;
      channelRef.current.forEach((c) => {
        if (c) supabase.removeChannel(c);
      });
      channelRef.current = [];
    };
  }, [origin, refId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !session || !uid) return;

    const { error } = await supabase.from("messages").insert({
      session_id: session.id,
      sender_id: uid,
      body,
    });
    if (error) {
      toast.error("Couldn't send the message.");
      return;
    }
    setDraft("");
  }

  async function handleMarkLeft() {
    if (!session) return;
    const { error } = await supabase
      .from("sessions")
      .update({ status: "left" })
      .eq("id", session.id)
      .eq("status", "active");
    if (error) toast.error("Couldn't update the session.");
  }

  async function handleEnd(reason?: string) {
    if (!session || endingRef.current) return;
    endingRef.current = true;
    try {
      const res = await fetch(`/api/session/${session.id}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't end the session.");
        return;
      }
      setSession(data.session);
      setEndDialogOpen(false);
      setEndReason("");
      setEndDetails("");
    } catch {
      toast.error("Couldn't end the session.");
    } finally {
      endingRef.current = false;
    }
  }

  async function handleConfirmEnd() {
    const reason = endReason
      ? endDetails.trim()
        ? `${endReason} — ${endDetails.trim()}`
        : endReason
      : endDetails.trim() || undefined;
    await handleEnd(reason);
  }

  function handleExtend() {
    setExtensionMs((m) => m + EXTEND_MS);
    toast.success("Session extended by 5 minutes.");
  }

  // Tick while the session is active so the countdown stays fresh.
  useEffect(() => {
    if (session?.status !== "active") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [session?.id, session?.status]);

  const startedAtMs = session?.started_at ? Date.parse(session.started_at) : null;
  const endAtMs = startedAtMs != null ? startedAtMs + SESSION_MS + extensionMs : null;
  const remainingMs = endAtMs != null ? Math.max(0, endAtMs - now) : null;
  const isActive = session?.status === "active";
  const showWarning = isActive && remainingMs != null && remainingMs <= WARN_MS;
  const showExtend = isActive && remainingMs != null && remainingMs > 0 && remainingMs <= WARN_MS;
  const overdue = isActive && remainingMs === 0;

  // Auto-end when the 15-minute session (plus extensions) elapses.
  useEffect(() => {
    if (!overdue || autoEndRef.current) return;
    autoEndRef.current = true;
    void handleEnd(session ? "Session auto-ended after 15 minutes." : undefined);
    toast.info("Your session has ended automatically.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overdue]);

  function formatRemaining(ms: number): string {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function handleSaveNotes() {
    if (!session) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/session/${session.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Couldn't save notes.");
        return;
      }
      toast.success("Notes saved.");
    } catch {
      toast.error("Couldn't save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleComplete() {
    if (!session) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/session/${session.id}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't finalize the session.");
        return;
      }
      setSession(data.session);
      if (data.document) {
        toast.success(
          "Session completed. Notes saved to the customer's record.",
        );
      } else {
        toast.success("Session completed.");
      }
    } catch {
      toast.error("Couldn't finalize the session.");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Opening your session…
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          This session isn&apos;t available to you right now.
        </CardContent>
      </Card>
    );
  }

  const isOver = session.status === "ended" || session.status === "completed";

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {session.mode === "phone" ? (
              <Phone className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </div>
          <div>
            <CardTitle className="text-base">Live Session</CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {session.mode} · {session.status}
              {isActive && remainingMs != null && (
                <span className="ml-2 inline-flex items-center gap-1 text-foreground">
                  <Timer className="h-3 w-3" />
                  {formatRemaining(remainingMs)} remaining
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkLeft}
            disabled={isOver || session.status !== "active"}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Leave
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setEndDialogOpen(true)}
            disabled={isOver}
          >
            <LogOut className="mr-2 h-4 w-4" />
            End Session
          </Button>
        </div>
      </CardHeader>

      {showWarning && (
        <div className="flex flex-wrap items-center gap-3 border-b border-crisis/30 bg-crisis/10 px-4 py-2.5 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-crisis" />
          <span className="text-foreground">
            {remainingMs === 0
              ? "Session time has elapsed."
              : "Your session will end within the next minute."}
          </span>
          {showExtend && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={handleExtend}
            >
              <Timer className="mr-1.5 h-4 w-4" />
              Extend by 5 min
            </Button>
          )}
        </div>
      )}

      <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <UserPlus className="h-4 w-4 text-primary" />
          {session.mode === "phone"
            ? "Voice calls connect via the listener dialer (Twilio — client setup pending)."
            : "Chat is live — messages appear in real time for both of you."}
        </div>

        {session.listener_id === uid && (
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <StickyNote className="h-4 w-4 text-primary" />
              Debrief notes
              <span className="text-xs font-normal text-muted-foreground">
                (visible to the listener & admins)
              </span>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private session notes…"
              rows={3}
              disabled={isOver}
            />
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={isOver || savingNotes}
              >
                {savingNotes ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save notes
              </Button>
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={isOver || completing}
              >
                {completing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Complete session
              </Button>
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.kind === "system" ? (
            <div
              key={m.id}
              className="self-center rounded-full bg-muted px-4 py-1 text-xs text-muted-foreground"
            >
              {m.body}
            </div>
          ) : (
            <div
              key={m.id}
              className={`flex max-w-[75%] flex-col gap-1 ${
                m.sender_id === uid ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 text-sm ${
                  m.sender_id === uid
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {m.body}
              </div>
              <span className="px-1 text-[10px] text-muted-foreground">
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </CardContent>

      {!isOver && (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t p-3"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={!draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>End this session?</DialogTitle>
            <DialogDescription>
              Choose why the session is ending (optional). This is recorded in
              the session history for safety review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="end-reason">Reason</Label>
              <select
                id="end-reason"
                value={endReason}
                onChange={(e) => setEndReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">No reason</option>
                {END_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-details">Details (optional)</Label>
              <Textarea
                id="end-details"
                value={endDetails}
                onChange={(e) => setEndDetails(e.target.value)}
                placeholder="Anything a safety reviewer should know…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmEnd}>
              <LogOut className="mr-2 h-4 w-4" />
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
