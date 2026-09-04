"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Segment = { id: string; label: string; count: number };

export function AdminCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segment, setSegment] = useState<string>("customers");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/admin/email-segments")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSegments(data.segments ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  const selected = segments.find((s) => s.id === segment);
  const previewCount = segment === "all" ? "everyone with an email" : String(selected?.count ?? "…");

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please add a subject and message.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't send the email.");
        return;
      }
      toast.success(`Email sent to ${data.delivered ?? 0} of ${data.total ?? 0} recipient(s).`);
      setOpen(false);
      setSubject("");
      setBody("");
      setSegment("customers");
    } catch {
      toast.error("Couldn't send the email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Mail className="mr-2 h-4 w-4" />
        Send email
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send an email</DialogTitle>
            <DialogDescription>
              Reach team members and consumers with a notice or campaign.
              Delivery needs a verified sender domain; recipients also get an
              in-app notification.
            </DialogDescription>
          </DialogHeader>

          {segments.length === 0 ? (
            <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading segments…
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Recipients</Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {previewCount} ~recipient(s)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="camp-subject">Subject</Label>
                <Input
                  id="camp-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  maxLength={200}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="camp-body">Message</Label>
                <Textarea
                  id="camp-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message… ({{ first_name }} is available)"
                  rows={5}
                  maxLength={5000}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}