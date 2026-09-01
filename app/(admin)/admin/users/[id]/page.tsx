import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ToggleActiveButton } from "@/components/admin/listener-actions";

export const metadata: Metadata = {
  title: "User Detail | Admin — Our Ears Are Open",
  description: "View consumer profile and session history.",
};

export default async function AdminUserDetailPage({
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
      "id, full_name, email, role, is_active, created_at, country, age_range, reason",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <div>
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  const { data: sessions } = await admin
    .from("sessions")
    .select(
      "id, mode, status, started_at, ended_at, listener_id, sessions_listener_id_fkey(full_name)",
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const recentDocs = null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.full_name ?? profile.email}
          </h1>
          <Badge variant={profile.is_active ? "default" : "secondary"}>
            {profile.is_active ? "Active" : "Deactivated"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <ToggleActiveButton
              profileId={profile.id}
              isActive={profile.is_active}
              name={profile.full_name ?? profile.email}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {profile.country && (
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{profile.country}</p>
                </div>
              )}
              {profile.age_range && (
                <div>
                  <p className="text-sm text-muted-foreground">Age range</p>
                  <p className="font-medium">{profile.age_range}</p>
                </div>
              )}
            </div>
            {profile.reason && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Reason for reaching out
                </p>
                <p className="text-sm">{profile.reason}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentDocs ?? (
                <p className="text-sm text-muted-foreground">
                  Sessions are grouped in the Sessions monitor. List them here
                  per consumer if needed.
                </p>
              )}
              {sessions && sessions.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {sessions.map((s) => {
                    const listener = Array.isArray(
                      s.sessions_listener_id_fkey,
                    )
                      ? s.sessions_listener_id_fkey[0]
                      : s.sessions_listener_id_fkey;
                    return (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                      >
                        <span className="capitalize">
                          {s.mode} session
                          <span className="text-muted-foreground">
                            {" "}
                            · with{" "}
                            {listener?.full_name ?? "Listener"}
                          </span>
                        </span>
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
              ) : (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  No sessions yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
