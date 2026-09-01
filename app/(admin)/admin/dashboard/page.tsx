import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Dashboard | Our Ears Are Open",
  description: "Administration dashboard for platform oversight.",
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const now = new Date();
  const dayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
  const dayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: listenerCount }, { count: sessionCount }, { count: queueCount }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "listener")
        .eq("is_active", true),
      admin
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .gte("started_at", dayStart)
        .lt("started_at", dayEnd),
      admin
        .from("queue_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "waiting"),
    ]);

  const { data: recentPayments } = await admin
    .from("payments")
    .select("amount_cents")
    .eq("status", "succeeded")
    .gte("created_at", yesterday);

  const donations24h = (recentPayments ?? []).reduce(
    (sum, p) => sum + p.amount_cents,
    0,
  );

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
          value={listenerCount ?? 0}
          description="Currently enabled"
          icon="Headphones"
        />
        <StatsCard
          title="Sessions Today"
          value={sessionCount ?? 0}
          description="Started today"
          icon="Calendar"
        />
        <StatsCard
          title="Customers Waiting"
          value={queueCount ?? 0}
          description="Open chat queue"
          icon="Users"
        />
        <StatsCard
          title="Revenue (24h)"
          value={`$${((donations24h ?? 0) / 100).toFixed(2)}`}
          description="Succeeded payments"
          icon="DollarSign"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/listeners">Manage listeners</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/sessions">View sessions</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/users">Manage users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/reports">Reports</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Oversight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track listener hours against the 15 hr/week cap, review sessions,
              and manage consumer accounts from the admin portal.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/admin/listeners">View listener hours</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
