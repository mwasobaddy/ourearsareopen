import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Session History | Team Member Portal",
  description: "Your past chat and phone sessions.",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "outline"> = {
  completed: "secondary",
  active: "default",
  ended: "outline",
  left: "outline",
  pending: "outline",
};

export default async function TeamMemberSessionsPage() {
  const userClient = await createClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "listener") {
    redirect("/");
  }

  const { data: sessions } = await admin
    .from("sessions")
    .select(
      "id, mode, status, started_at, ended_at, notes, queue_entry_id, booking_id, created_at, profiles:user_id(full_name)",
    )
    .eq("listener_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Session History</h1>
        <p className="text-muted-foreground">
          Past chat and phone sessions. Notes are saved to each session.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">No sessions yet</p>
              <p className="mt-1 text-sm">
                Completed sessions will appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => {
                const customer = Array.isArray(session.profiles)
                  ? session.profiles[0]
                  : session.profiles;
                const type = session.mode === "phone" ? "Phone" : "Chat";
                return (
                  <li
                    key={session.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {session.mode === "phone" ? (
                          <Phone className="h-5 w-5 text-primary" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {customer?.full_name ?? "Consumer"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.started_at
                            ? new Date(
                                session.started_at,
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Not started"}{" "}
                          • {type}
                        </p>
                      </div>
                      <Badge
                        variant={STATUS_STYLES[session.status] ?? "outline"}
                      >
                        {session.status}
                      </Badge>
                      {session.notes && (
                        <Badge variant="secondary">Has notes</Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/session/${session.id}?origin=${
                          session.queue_entry_id ? "queue" : "booking"
                        }`}
                      >
                        View / open
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
