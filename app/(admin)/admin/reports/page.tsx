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
import { AdminCampaignDialog } from "@/components/admin/admin-campaign-dialog";

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

  const { count: noShowsThisMonth } = await admin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "no_show")
    .gte("created_at", monthStart);

  // Per-customer no-show tally (all time), newest first.
  const { data: noShowUsers } = await admin
    .from("bookings")
    .select("user_id, created_at")
    .eq("status", "no_show")
    .order("created_at", { ascending: false });

  const noShowByName: { id: string; full_name: string | null; count: number }[] = [];
  const seen = new Map<string, { id: string; full_name: string | null; count: number }>();
  for (const b of noShowUsers ?? []) {
    const existing = seen.get(b.user_id);
    if (existing) {
      existing.count += 1;
      continue;
    }
    const { data: prof } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", b.user_id)
      .maybeSingle();
    const row = {
      id: b.user_id,
      full_name: prof?.full_name ?? null,
      count: 1,
    };
    seen.set(b.user_id, row);
    noShowByName.push(row);
  }
  noShowByName.sort((a, b) => b.count - a.count);

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
      <div className="flex justify-end">
        <AdminCampaignDialog />
      </div>

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
        <StatsCard
          title="No-shows (this month)"
          value={noShowsThisMonth ?? 0}
          icon="Clock"
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

      <Card>
        <CardHeader>
          <CardTitle>No-shows by customer</CardTitle>
        </CardHeader>
        <CardContent>
          {noShowByName.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No no-shows recorded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {noShowByName.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="font-medium hover:underline"
                  >
                    {u.full_name ?? "Customer"}
                  </Link>
                  <span className="flex items-center gap-2">
                    <span className={u.count >= 2 ? "font-semibold text-destructive" : "text-muted-foreground"}>
                      {u.count} no-show{u.count !== 1 ? "s" : ""}
                    </span>
                    {u.count >= 2 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${u.id}`}>View</Link>
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
