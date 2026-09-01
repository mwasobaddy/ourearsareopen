"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Heart, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import PaymentForm from "@/components/payments/payment-form";
import { isStripeConfigured } from "@/lib/stripe-client";

const suggestedAmounts = [25, 50, 100, 500] as const;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function DonationClient() {
  const [amountCents, setAmountCents] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountLabel = useMemo(
    () => money.format(amountCents / 100),
    [amountCents],
  );

  function chooseAmount(cents: number) {
    setCustomAmount("");
    setAmountCents(cents);
  }

  function handleCustomAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setCustomAmount(raw);
    const numeric = parseInt(raw || "0", 10);
    if (!Number.isNaN(numeric) && numeric >= 1) {
      setAmountCents(numeric * 100);
    }
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (amountCents < 100) {
      toast.error("Please choose an amount of at least $1.");
      return;
    }

    if (!isStripeConfigured()) {
      setError(
        "Donations aren't configured yet. Please add your Stripe keys in .env.local.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "donation",
          amount_cents: amountCents,
          currency: "usd",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't start the donation.");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't start the donation.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (clientSecret) {
    return (
      <>
        <div className="rounded-lg bg-secondary p-4 text-sm text-foreground">
          <p className="font-semibold">{amountLabel} one-time donation</p>
          {donorEmail && (
            <p className="mt-1 text-muted-foreground">
              A receipt will be sent to {donorEmail}
            </p>
          )}
        </div>
        <Separator className="my-6" />
        <PaymentForm
          clientSecret={clientSecret}
          amountLabel={amountLabel}
          successUrl="/donate/success"
        />
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure, encrypted donation</span>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleStart} className="space-y-6">
      <div className="space-y-4">
        <Label>Select Amount</Label>
        <RadioGroup
          value={String(amountCents)}
          onValueChange={(v) => chooseAmount(Number(v))}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {suggestedAmounts.map((amount) => (
            <div key={amount}>
              <RadioGroupItem
                value={String(amount * 100)}
                id={`amount-${amount}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`amount-${amount}`}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border bg-background p-4 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary"
              >
                <span className="text-lg font-bold text-foreground">
                  {money.format(amount)}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customAmount">Or enter a custom amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="customAmount"
            type="text"
            inputMode="numeric"
            placeholder="Other amount"
            className="pl-7"
            value={customAmount}
            onChange={handleCustomAmount}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Your Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="donorFirstName">First Name</Label>
            <Input
              id="donorFirstName"
              placeholder="First name"
              value={donorName.split(" ")[0] ?? ""}
              onChange={(e) =>
                setDonorName(([first, ...rest]) =>
                  [e.target.value, rest.join(" ")].filter(Boolean).join(" "),
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="donorLastName">Last Name</Label>
            <Input
              id="donorLastName"
              placeholder="Last name"
              value={donorName.split(" ").slice(1).join(" ")}
              onChange={(e) => setDonorName(`${donorName.split(" ")[0] ?? ""} ${e.target.value}`.trim())}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="donorEmail">Email</Label>
          <Input
            id="donorEmail"
            type="email"
            placeholder="you@example.com"
            required
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Heart className="mr-2 h-5 w-5" />
        )}
        {loading ? "Preparing secure checkout…" : `Donate ${amountLabel}`}
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        <span>Secure, encrypted donation</span>
      </div>
    </form>
  );
}
