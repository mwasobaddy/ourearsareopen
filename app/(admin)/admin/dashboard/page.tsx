import type { Metadata } from "next";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Dashboard | Our Ears Are Open",
  description: "Administration dashboard for platform oversight.",
};

export default function AdminDashboardPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and quick stats
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Listeners"
          value="8"
          description="Currently online"
          icon="Headphones"
        />
        <StatsCard
          title="Today's Sessions"
          value="24"
          description="Completed so far"
          icon="Calendar"
        />
        <StatsCard
          title="Queue Length"
          value="3"
          description="Waiting for listener"
          icon="Users"
        />
        <StatsCard
          title="Recent Donations"
          value="$127"
          description="Last 24 hours"
          icon="DollarSign"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a
              href="/admin/listeners"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Manage listeners
            </a>
            <a
              href="/admin/sessions"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              View sessions
            </a>
            <a
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Manage users
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will show recent platform events when wired to API.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
