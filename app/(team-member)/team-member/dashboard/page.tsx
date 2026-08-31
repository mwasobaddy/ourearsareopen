import type { Metadata } from "next";
import {
  Clock,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | Team Member Portal",
  description: "Your team member dashboard with hours, calls, and chats.",
};

// Mock data - replace with API calls
const stats = {
  hoursThisWeek: 8.5,
  hoursThisMonth: 32,
  hoursCap: 15,
  callsThisWeek: 12,
  chatsThisWeek: 18,
};

const todayAppointments = [
  { id: "1", consumer: "Alex M.", type: "Phone", time: "2:00 PM", status: "upcoming" },
  { id: "2", consumer: "Jordan D.", type: "Chat", time: "4:30 PM", status: "upcoming" },
];

export default function TeamMemberDashboardPage() {
  const hoursPercent = Math.min(100, (stats.hoursThisWeek / stats.hoursCap) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hours, sessions, and appointments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Hours This Week"
          value={`${stats.hoursThisWeek} / ${stats.hoursCap}`}
          description="15 hr/week cap (1099)"
          icon="Clock"
        />
        <StatsCard
          title="Hours This Month"
          value={stats.hoursThisMonth}
          description="Total hours"
          icon="Clock"
        />
        <StatsCard
          title="Calls This Week"
          value={stats.callsThisWeek}
          description="Phone sessions"
          icon="Phone"
        />
        <StatsCard
          title="Chats This Week"
          value={stats.chatsThisWeek}
          description="Chat sessions"
          icon="MessageSquare"
        />
      </div>

      {/* Hours progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Weekly Hours (15 hr cap)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={hoursPercent} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.hoursThisWeek} of {stats.hoursCap} hours used this week
          </p>
        </CardContent>
      </Card>

      {/* Today's appointments */}
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
          {todayAppointments.length > 0 ? (
            <ul className="space-y-4">
              {todayAppointments.map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">{apt.consumer}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.type} at {apt.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/session/${apt.id}`}>
                        {apt.type === "Phone" ? "Start Call" : "Open Chat"}
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No appointments today</p>
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
