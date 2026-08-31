import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Billing | Super Admin | Our Ears Are Open",
  description: "Stripe and billing configuration.",
};

export default function SuperAdminBillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Stripe</h1>
        <p className="text-muted-foreground">Payment provider configuration. API keys are stored in environment variables.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Connected</Badge>
            <span className="text-sm text-muted-foreground">Stripe account linked</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              readOnly
              value="https://api.ourearsareopen.com/api/webhooks/stripe"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Add this URL in Stripe Dashboard → Developers → Webhooks.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Booking Product ID</Label>
              <Input placeholder="prod_..." readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Donation Product ID</Label>
              <Input placeholder="prod_..." readOnly className="bg-muted" />
            </div>
          </div>
          <Button variant="outline" disabled>Update (via env)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
