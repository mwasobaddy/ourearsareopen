import type { Metadata } from "next";
import { DollarSign, Users, Headphones, TrendingUp, AlertTriangle, Info, Clock, Ticket } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { getPlatformStats } from "@/lib/super-admin-data";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | Our Ears Are Open",
  description: "Platform-wide administration and health metrics.",
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function SuperAdminDashboardPage() {
  const admin = await requireSuperAdmin();
  const stats = await getPlatformStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform health and metrics. Signed in as{" "}
          <span className="font-medium text-foreground">{admin.role}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value={money(stats.totalRevenue)} icon="DollarSign" />
        <StatsCard title="Total Users" value={String(stats.totalUsers)} icon="Users" />
        <StatsCard
          title="Active Listeners"
          value={`${stats.activeListeners} / ${stats.totalListeners}`}
          icon="Headphones"
        />
        <StatsCard title="Sessions This Month" value={String(stats.monthSessions)} icon="TrendingUp" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" /> Revenue this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(stats.monthRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" /> Waiting in queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Ticket className="h-4 w-4" /> Open support tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.openTickets}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.alerts.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border p-4"
              >
                <Info className={`h-5 w-5 ${a.level === "warning" ? "text-amber-500" : "text-muted-foreground"}`} />
                <p className="text-sm text-muted-foreground">{a.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/super-admin/config" className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted">
              Update org config
            </a>
            <a href="/super-admin/features" className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted">
              Manage feature flags
            </a>
            <a href="/super-admin/users" className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted">
              Assign roles
            </a>
            <a href="/super-admin/audit" className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted">
              View audit log
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
