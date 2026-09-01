"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Ticket = {
  id: string;
  kind: "refund" | "support";
  subject: string;
  description: string | null;
  internal_notes: string | null;
  status: "open" | "resolved";
  user_id: string | null;
  payment_id: string | null;
  created_at: string;
  resolved_at: string | null;
};

export function SupportPanel({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<"refund" | "support">("support");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          subject,
          description,
          user_id: userId.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Couldn't create the ticket.");
        return;
      }
      toast.success(kind === "refund" ? "Refund request recorded" : "Ticket created");
      setSubject("");
      setDescription("");
      router.refresh();
    } catch {
      toast.error("Couldn't create the ticket.");
    }
  }

  function act(ticketId: string, action: "resolve" | "reopen") {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/support/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          toast.error("Couldn't update the ticket.");
          return;
        }
        router.refresh();
      } catch {
        toast.error("Couldn't update the ticket.");
      }
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CardBlock title="Initiate Refund / Ticket">
        <form onSubmit={createTicket} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "refund" | "support")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Refund requests are recorded here; the actual Stripe refund is
              issued once Stripe keys are configured (client).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={kind === "refund" ? "Payment / booking ID" : "Issue..."}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_id">User ID (optional)</Label>
            <Input
              id="user_id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Consumer profile id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Details (internal)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>
          <Button type="submit" disabled={!subject}>
            <Plus className="mr-2 h-4 w-4" />
            {kind === "refund" ? "Log refund request" : "Create ticket"}
          </Button>
        </form>
      </CardBlock>

      <CardBlock title="Open tickets">
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {t.kind} · {t.subject}
                  </span>
                  <Badge variant={t.status === "open" ? "default" : "secondary"}>
                    {t.status}
                  </Badge>
                </div>
                {t.description && (
                  <p className="mt-1 text-muted-foreground">{t.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  {t.status === "open" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => act(t.id, "resolve")}
                      disabled={pending}
                    >
                      {pending ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      Resolve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => act(t.id, "reopen")}
                      disabled={pending}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardBlock>
    </div>
  );
}

function CardBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
