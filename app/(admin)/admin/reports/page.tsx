import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllListenerStats, HOURS_CAP } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Reports | Admin — Our Ears Are Open",
  description: "Sessions, revenue, listener utilization, queue stats.",
};

export default async function AdminReportsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const { count: sessionsThisMonth } = await admin
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart);

  const { data: paymentsThisMonth } = await admin
    .from("payments")
    .select("amount_cents, type")
    .eq("status", "succeeded")
    .gte("created_at", monthStart);

  const revenue =
    (paymentsThisMonth ?? []).reduce((s, p) => s + p.amount_cents, 0) / 100;

  const { count: newCustomers } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "customer")
    .gte("created_at", monthStart);

  const listeners = await getAllListenerStats();
  const activeListeners = listeners.filter((l) => l.is_active).length;
  const overCap = listeners.filter((l) => l.hoursThisWeek > HOURS_CAP).length;

  const utilization = activeListeners
    ? Math.round(
        (listeners.reduce((s, l) => s + l.hoursThisWeek, 0) /
          (activeListeners * HOURS_CAP)) *
          100,
      )
    : 0;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      <p className="text-muted-foreground">
        Live aggregates computed from real sessions, payments, and listeners.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Sessions (this month)"
          value={sessionsThisMonth ?? 0}
          icon="Calendar"
        />
        <StatsCard
          title="Revenue (this month)"
          value={`$${revenue.toFixed(2)}`}
          icon="DollarSign"
        />
        <StatsCard
          title="Active Listeners"
          value={activeListeners}
          icon="Users"
        />
        <StatsCard
          title="Listener Utilization"
          value={`${utilization}%`}
          description="Of the weekly cap"
          icon="BarChart3"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listener hours & cap</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {listeners.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No listeners yet.
              </li>
            ) : (
              listeners.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <span className="font-medium">
                    {l.full_name ?? l.email}
                  </span>
                  <span className="text-muted-foreground">
                    {l.hoursThisWeek} / {HOURS_CAP} hrs this week
                    {l.hoursThisWeek > HOURS_CAP ? " (over cap)" : ""}
                  </span>
                </li>
              ))
            )}
          </ul>
          {overCap > 0 && (
            <p className="mt-3 text-sm text-destructive">
              {overCap} listener(s) over the {HOURS_CAP} hr/week cap.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New customers</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {newCustomers ?? 0} customer accounts created this month.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin/users">View users</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
