"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PaymentForm from "@/components/payments/payment-form";
import { isStripeConfigured } from "@/lib/stripe-client";

const SUGGESTED_AMOUNTS = [
  { value: "100", label: "$1", description: "Minimum" },
  { value: "500", label: "$5" },
  { value: "1000", label: "$10" },
  { value: "2500", label: "$25" },
];

const MINIMUM_CENTS = 100;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ChatQueueDonationForm() {
  const [amountCents, setAmountCents] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountLabel = useMemo(
    () => money.format(amountCents / 100),
    [amountCents],
  );

  function chooseAmount(cents: number) {
    setCustomAmount("");
    setAmountCents(cents);
    setError(null);
  }

  function handleCustomAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setCustomAmount(raw);
    const numeric = parseInt(raw || "0", 10);
    if (!Number.isNaN(numeric) && numeric >= 1) {
      setAmountCents(numeric * 100);
    }
    setError(null);
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (amountCents < MINIMUM_CENTS) {
      setError(`Minimum donation is ${money.format(MINIMUM_CENTS / 100)} to join the queue.`);
      return;
    }

    if (!isStripeConfigured()) {
      setError(
        "Payments aren't configured yet. Please add your Stripe keys in .env.local.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "queue", amount_cents: amountCents }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't start the payment.");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setPaymentId(data.paymentId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't start the payment.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (clientSecret && paymentId) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Join the Queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            {amountLabel} donation — complete payment to be added to the queue.
          </p>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <PaymentForm
            clientSecret={clientSecret}
            amountLabel={amountLabel}
            successUrl={`/chat-queue/success?payment=${paymentId}`}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Donate to Join the Queue</CardTitle>
        <p className="text-sm text-muted-foreground">
          Minimum $1. Your donation helps us grow and work toward free, 24/7 support for everyone.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-3">
            <Label>Select or enter amount</Label>
            <RadioGroup
              value={String(amountCents)}
              onValueChange={(v) => chooseAmount(Number(v))}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {SUGGESTED_AMOUNTS.map((amt) => (
                <div key={amt.value}>
                  <RadioGroupItem
                    value={amt.value}
                    id={`amt-${amt.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`amt-${amt.value}`}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border bg-background p-4 transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <span className="font-semibold text-foreground">
                      {amt.label}
                    </span>
                    {amt.description && (
                      <span className="mt-0.5 text-xs text-muted-foreground">
                        {amt.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="custom-amount">Or enter a custom amount (USD)</Label>
              <Input
                id="custom-amount"
                type="text"
                inputMode="numeric"
                placeholder="5.00"
                value={customAmount}
                onChange={handleCustomAmount}
                className="max-w-[180px]"
              />
            </div>
          </div>

          {error && <p className="text-sm text-crisis">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing secure checkout…
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Donate {amountLabel} &amp; Join Queue
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
