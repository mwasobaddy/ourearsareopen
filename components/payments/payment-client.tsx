"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PaymentForm from "@/components/payments/payment-form";
import { isStripeConfigured } from "@/lib/stripe-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  bookingId: string;
};

export default function PaymentClient({ bookingId }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function createIntent() {
      if (!isStripeConfigured()) {
        setError(
          "Payments aren't configured yet. Please add your Stripe keys in .env.local.",
        );
        setLoading(false);
        return;
      }

      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "booking", bookings_id: bookingId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't start the payment. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!cancelled) {
        setClientSecret(data.clientSecret);
        setLoading(false);
      }
    }

    createIntent().catch(() => {
      if (!cancelled) {
        toast.error("Couldn't reach the payment service.");
        setError("Couldn't reach the payment service.");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Preparing secure payment…
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Payment unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PaymentForm
      clientSecret={clientSecret}
      amountLabel="$10.99"
      successUrl={`/payment/success?booking=${bookingId}`}
    />
  );
}
