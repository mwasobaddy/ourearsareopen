import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Feature Flags | Super Admin | Our Ears Are Open",
  description: "Manage platform feature flags.",
};

export default function SuperAdminFeaturesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-muted-foreground">Enable or disable platform features.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="openQueue" className="text-base font-medium">Open Chat Queue</Label>
              <p className="text-sm text-muted-foreground">Allow consumers to join the chat queue with a minimum donation.</p>
            </div>
            <Switch id="openQueue" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="donations" className="text-base font-medium">Donations</Label>
              <p className="text-sm text-muted-foreground">Allow one-off donations on the donate page.</p>
            </div>
            <Switch id="donations" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="freeBooking" className="text-base font-medium">Free Booking Option</Label>
              <p className="text-sm text-muted-foreground">Allow consumers to book a free 15-minute session.</p>
            </div>
            <Switch id="freeBooking" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="scheduledPhone" className="text-base font-medium">Scheduled Phone Sessions</Label>
              <p className="text-sm text-muted-foreground">Allow phone appointments (by appointment only).</p>
            </div>
            <Switch id="scheduledPhone" defaultChecked />
          </div>
          <Button>Save feature flags</Button>
        </CardContent>
      </Card>
    </div>
  );
}
