import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LISTENER_PRICE_CENTS,
  MIN_DONATION_CENTS,
  MAX_DONATION_CENTS,
  isStripeConfigured,
} from "@/lib/stripe";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Billing | Super Admin | Our Ears Are Open",
  description: "Stripe / billing configuration.",
};

function money(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function SuperAdminBillingPage() {
  await requireSuperAdmin();

  const admin = createAdminClient();
  const { data } = await admin
    .from("payments")
    .select("id, type, amount_cents, currency, status, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  const configured = isStripeConfigured();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Stripe and payment configuration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              Stripe status
              <Badge variant={configured ? "outline" : "destructive"}>
                {configured ? "configured" : "not configured"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Listener session price</span>
              <span className="font-medium">{money(LISTENER_PRICE_CENTS)}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Donation range</span>
              <span className="font-medium">
                {money(MIN_DONATION_CENTS)} – {money(MAX_DONATION_CENTS)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Product/price editing through the Stripe Dashboard is a client
              task (needs Stripe keys + webhook). This page reflects the
              configured price constants and recent payments.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(data ?? []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{p.type}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {p.created_at.slice(0, 10)}
                    </span>
                  </div>
                  <Badge variant={p.status === "succeeded" ? "outline" : "secondary"}>
                    {p.status}
                  </Badge>
                  <span className="font-medium">{money(p.amount_cents)}</span>
                </div>
              ))}
              {(data ?? []).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No payments yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
