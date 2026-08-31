import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Reports | Admin — Our Ears Are Open",
  description: "Sessions, revenue, listener utilization, queue stats.",
};

export default function AdminReportsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      <p className="text-muted-foreground">
        Sessions per period, revenue, listener utilization, queue stats. Wire to GET /api/admin/reports.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Sessions (this month)" value="142" icon="Calendar" />
        <StatsCard title="Revenue (this month)" value="$2,840" icon="DollarSign" />
        <StatsCard title="Active Listeners" value="12" icon="Users" />
        <StatsCard title="Avg. Queue Wait" value="4 min" icon="BarChart3" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select date range for detailed reports.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" className="mt-1" />
          </div>
          <div className="flex items-end">
            <Button>Generate Report</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
