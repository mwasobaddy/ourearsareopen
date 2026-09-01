import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllListenerStats,
  HOURS_CAP,
} from "@/lib/admin-data";
import { ToggleActiveButton } from "@/components/admin/listener-actions";

export const metadata: Metadata = {
  title: "Listener Detail | Admin | Our Ears Are Open",
  description: "View and manage listener details.",
};

export default async function AdminListenerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const {
    data: profile,
    error,
  } = await admin
    .from("profiles")
    .select(
      "id, full_name, email, is_active, open_queue_enabled, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <div>
        <p className="text-muted-foreground">Listener not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/listeners">Back to listeners</Link>
        </Button>
      </div>
    );
  }

  const all = await getAllListenerStats();
  const stats = all.find((l) => l.id === id && l.role === "listener");

  const { data: sessions } = await admin
    .from("sessions")
    .select(
      "id, mode, status, started_at, ended_at, notes, profiles:user_id(full_name)",
    )
    .eq("listener_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const name = profile.full_name ?? profile.email;

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/listeners">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <Badge variant={profile.is_active ? "default" : "secondary"}>
              {profile.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
        <ToggleActiveButton
          profileId={profile.id}
          isActive={profile.is_active}
          name={name}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Hours this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.hoursThisWeek ?? 0} / {HOURS_CAP}
            </p>
            <Progress
              value={Math.min(
                100,
                ((stats?.hoursThisWeek ?? 0) / HOURS_CAP) * 100,
              )}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Hours this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.hoursThisMonth ?? 0} hrs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Calls this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.callsThisWeek ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Chats this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.chatsThisWeek ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => {
                const customer = Array.isArray(s.profiles)
                  ? s.profiles[0]
                  : s.profiles;
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {s.mode === "phone" ? (
                        <Phone className="h-4 w-4 text-primary" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">
                          {customer?.full_name ?? "Consumer"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.started_at
                            ? new Date(s.started_at).toLocaleDateString()
                            : "Not started"}{" "}
                          • {s.mode}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        s.status === "completed" ? "secondary" : "outline"
                      }
                    >
                      {s.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
