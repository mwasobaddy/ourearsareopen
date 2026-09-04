"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  MessageSquare,
  Users,
  UserPlus,
  ArrowRight,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PoolCustomer = {
  id: string;
  user_id: string;
  created_at: string;
  customer: { full_name?: string | null; reason?: string | null } | null;
};

type CustomerProfile = {
  full_name?: string | null;
  gender_identity?: string | null;
  age_range?: string | null;
  pronouns?: string | null;
  country?: string | null;
  reason?: string | null;
  prior_therapy?: string | null;
  relationship_status?: string | null;
  services_consent?: boolean | null;
  profile_complete?: boolean | null;
};

export function QueuePanel() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [pool, setPool] = useState<PoolCustomer[]>([]);
  const [toggling, setToggling] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineSaving, setDeclineSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cfgRes, poolRes] = await Promise.all([
        fetch("/api/queue/toggle", { method: "GET" }),
        fetch("/api/queue/pool"),
      ]);
      // toggle route is POST-only; read availability from a simple fetch instead.
      const cfg: { open_queue_enabled?: boolean } =
        cfgRes.ok ? await cfgRes.json() : {};
      const poolData: { pool?: PoolCustomer[] } =
        poolRes.ok ? await poolRes.json() : {};
      setEnabled(cfg.open_queue_enabled ?? false);
      setPool(poolData.pool ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await fetch("/api/queue/toggle", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't update availability.");
        return;
      }
      setEnabled(data.open_queue_enabled);
      if (data.assignedEntry) {
        toast.success("A waiting consumer was assigned to you.");
        // refresh pool (they left it), keep them accepted
      }
      load();
    } catch {
      toast.error("Couldn't update availability.");
    } finally {
      setToggling(false);
    }
  }

  async function handleAccept(entryId: string) {
    setAcceptingId(entryId);
    try {
      const res = await fetch("/api/queue/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue_entry_id: entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't accept that consumer.");
        return;
      }
      toast.success("Consumer accepted. Start their session.");
      window.location.href = `/session/${entryId}?origin=queue`;
    } catch {
      toast.error("Couldn't accept that consumer.");
    } finally {
      setAcceptingId(null);
    }
  }

  async function viewProfile(userId: string) {
    setShowProfile(true);
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/queue/customer/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't load the profile.");
        setProfile(null);
        return;
      }
      setProfile(data.customer);
    } catch {
      toast.error("Couldn't load the profile.");
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleDecline(entryId: string) {
    const reason = declineReason.trim();
    if (!reason) {
      toast.error("Please add a reason before declining.");
      return;
    }
    setDeclineSaving(true);
    try {
      const res = await fetch("/api/queue/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue_entry_id: entryId, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't decline that consumer.");
        setDeclineSaving(false);
        return;
      }
      toast.success("Declined. This consumer has been notified.");
      setDecliningId(null);
      setDeclineReason("");
      setDeclineSaving(false);
      load();
    } catch {
      toast.error("Couldn't decline that consumer.");
      setDeclineSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading the queue…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="queue-available">Available for queue</Label>
              <p className="text-sm text-muted-foreground">
                When on, consumers can be matched to you from the open queue
              </p>
            </div>
            <Switch
              id="queue-available"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={toggling}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Next in Queue
            <Badge variant="secondary" className="ml-auto">
              {pool.length} waiting
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pool.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">No one in queue right now</p>
              <p className="mt-1 text-sm">
                Stay available and you&apos;ll be notified when someone joins.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pool.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {item.customer?.full_name ?? "Consumer"}
                      </p>
                      {item.customer?.reason ? (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {item.customer.reason}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Waiting in chat queue
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(item.id)}
                      disabled={acceptingId === item.id}
                    >
                      {acceptingId === item.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewProfile(item.user_id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View profile
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDecliningId(item.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {enabled && (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 border-t p-4">
            <p className="text-sm text-muted-foreground">
              Open a direct chat room with a consumer.
            </p>
            <Button asChild variant="outline">
              <Link href="/team-member/sessions">
                My sessions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Consumer Profile</DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading…
            </div>
          ) : profile ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">
                  {profile.full_name ?? "Consumer"}
                </p>
                <p className="text-muted-foreground">
                  {[
                    profile.age_range,
                    profile.gender_identity,
                    profile.pronouns,
                    profile.country,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No demographic info"}
                </p>
              </div>
              <ProfileRow label="Why they're here" value={profile.reason} />
              <ProfileRow
                label="Prior therapy"
                value={profile.prior_therapy}
              />
              <ProfileRow
                label="Relationship status"
                value={profile.relationship_status}
              />
              <p className="text-xs text-muted-foreground">
                Services consent &nbsp;
                {profile.services_consent ? "granted" : "not granted"}
                {" · "}
                {profile.profile_complete
                  ? "full profile"
                  : "basic profile"}
              </p>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No profile available.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={decliningId !== null} onOpenChange={(o) => !o && setDecliningId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline this consumer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Let the consumer know why, so we can help them connect another
              way. The customer is gently notified with a way to rejoin.
            </p>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. At capacity, or not the right fit — we'll connect you with someone else."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDecliningId(null)}
                disabled={declineSaving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => decliningId && handleDecline(decliningId)}
                disabled={declineSaving || !declineReason.trim()}
              >
                {declineSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5">{value || "—"}</p>
    </div>
  );
}
