import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Clock,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MarkNoShowButton } from "@/components/team-member/mark-no-show-button";

export const metadata: Metadata = {
  title: "Dashboard | Team Member Portal",
  description: "Your team member dashboard with hours, calls, and chats.",
};

const HOURS_CAP = 15;

function getStartOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getStartOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function hoursBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, ms) / 3_600_000;
}

export default async function TeamMemberDashboardPage() {
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

  const now = new Date();
  const weekStart = getStartOfWeek(now).toISOString();
  const monthStart = getStartOfMonth(now).toISOString();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const { data: sessions } = await admin
    .from("sessions")
    .select("id, mode, status, started_at, ended_at")
    .eq("listener_id", user.id);

  const done = (sessions ?? []).filter(
    (s) => s.status === "ended" || s.status === "completed",
  );

  let hoursThisWeek = 0;
  let hoursThisMonth = 0;
  let callsThisWeek = 0;
  let chatsThisWeek = 0;

  for (const s of done) {
    if (!s.started_at || !s.ended_at) continue;
    const h = hoursBetween(s.started_at, s.ended_at);
    if (s.started_at >= weekStart) {
      hoursThisWeek += h;
      if (s.mode === "phone") callsThisWeek += 1;
      else chatsThisWeek += 1;
    }
    if (s.started_at >= monthStart) hoursThisMonth += h;
  }

  hoursThisWeek = Math.round(hoursThisWeek * 100) / 100;
  hoursThisMonth = Math.round(hoursThisMonth * 100) / 100;

  // Today's confirmed scheduled appointments for this listener.
  const { data: todayBookings } = await admin
    .from("bookings")
    .select("id, type, slot_start, slot_end, user_id")
    .eq("listener_id", user.id)
    .eq("status", "confirmed")
    .gte("slot_start", dayStart)
    .lt("slot_start", dayEnd);

  const hoursPercent = Math.min(100, (hoursThisWeek / HOURS_CAP) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hours, sessions, and appointments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Hours This Week"
          value={`${hoursThisWeek} / ${HOURS_CAP}`}
          description="15 hr/week cap (1099)"
          icon="Clock"
        />
        <StatsCard
          title="Hours This Month"
          value={hoursThisMonth}
          description="Total hours"
          icon="Clock"
        />
        <StatsCard
          title="Calls This Week"
          value={callsThisWeek}
          description="Phone sessions"
          icon="Phone"
        />
        <StatsCard
          title="Chats This Week"
          value={chatsThisWeek}
          description="Chat sessions"
          icon="MessageSquare"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Weekly Hours ({HOURS_CAP} hr cap)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={hoursPercent} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            {hoursThisWeek} of {HOURS_CAP} hours used this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Appointments
          </CardTitle>
          <Link href="/team-member/appointments">
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayBookings && todayBookings.length > 0 ? (
            <ul className="space-y-4">
              {todayBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {b.type === "phone" ? "Phone" : "Chat"} appointment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {b.slot_start
                        ? new Date(b.slot_start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Time to be confirmed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/session/${b.id}?origin=booking`}>
                        {b.type === "phone" ? "Start Call" : "Open Chat"}
                      </Link>
                    </Button>
                    <MarkNoShowButton bookingId={b.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No scheduled appointments today</p>
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
