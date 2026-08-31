import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Support & Refunds | Admin | Our Ears Are Open",
  description: "Initiate refunds and manage support actions.",
};

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support & Refunds</h1>
        <p className="mt-1 text-muted-foreground">
          Initiate refunds and add internal notes for support cases.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Initiate Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentId">Payment ID / Booking ID</Label>
              <Input id="paymentId" placeholder="pi_xxx or bk_xxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (internal)</Label>
              <Textarea
                id="reason"
                placeholder="Optional notes for audit..."
                rows={2}
              />
            </div>
            <Button>Submit Refund Request</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add notes to user or session records from the Users and Sessions
              pages. Refunds are logged in the audit trail.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/admin/sessions">View Sessions</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
