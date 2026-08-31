import type { Metadata } from "next";
import { DollarSign, Users, Headphones, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | Our Ears Are Open",
  description: "Platform-wide administration and configuration.",
};

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform health and metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value="$12,450" icon="DollarSign" />
        <StatsCard title="Total Users" value="1,234" icon="Users" />
        <StatsCard title="Active Listeners" value="24" icon="Headphones" />
        <StatsCard title="Sessions This Month" value="456" icon="TrendingUp" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">No critical alerts</p>
                <p className="text-sm text-muted-foreground">Platform is operating normally.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/super-admin/config"
              className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              Update org config
            </a>
            <a
              href="/super-admin/features"
              className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              Manage feature flags
            </a>
            <a
              href="/super-admin/audit"
              className="block rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              View audit log
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
