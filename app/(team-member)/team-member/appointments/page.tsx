import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Phone, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Appointments | Team Member Portal",
  description: "Your scheduled phone and chat sessions.",
};

export default async function TeamMemberAppointmentsPage() {
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

  const nowIso = new Date().toISOString();
  const { data: appointments } = await admin
    .from("bookings")
    .select(
      "id, type, slot_start, slot_end, status, profiles:user_id(full_name)",
    )
    .eq("listener_id", user.id)
    .in("status", ["pending", "confirmed"])
    .gte("slot_start", nowIso)
    .order("slot_start", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Your scheduled phone and chat sessions.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming
          </CardTitle>
          <Link href="/team-member/queue">
            <Button variant="outline" size="sm">
              No appointments? Join Chat Queue
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map((apt) => {
                const customer = Array.isArray(apt.profiles)
                  ? apt.profiles[0]
                  : apt.profiles;
                return (
                  <li
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {apt.type === "phone" ? (
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
                          {apt.slot_start
                            ? new Date(apt.slot_start).toLocaleString([], {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Time to be confirmed"}
                        </p>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {apt.type}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/session/${apt.id}?origin=booking`}>
                        {apt.type === "phone" ? "Start Call" : "Open Chat"}
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">No upcoming appointments</p>
              <p className="mt-1 text-sm">
                Jump into the chat queue when you&apos;re available.
              </p>
              <Link href="/team-member/queue">
                <Button className="mt-4">Join Chat Queue</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}