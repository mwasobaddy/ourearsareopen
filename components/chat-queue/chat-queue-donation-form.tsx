"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle } from "lucide-react";

const SUGGESTED_AMOUNTS = [
  { value: "1", label: "$1", description: "Minimum" },
  { value: "5", label: "$5" },
  { value: "10", label: "$10" },
  { value: "25", label: "$25" },
  { value: "custom", label: "Other" },
];

const MINIMUM_DOLLARS = 1;

export function ChatQueueDonationForm() {
  const [selectedAmount, setSelectedAmount] = useState("5");
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAmountInDollars = (): number => {
    if (selectedAmount === "custom") {
      const parsed = parseFloat(customAmount.replace(/[^0-9.]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    }
    return parseFloat(selectedAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = getAmountInDollars();

    if (amount < MINIMUM_DOLLARS) {
      setError(`Minimum donation is $${MINIMUM_DOLLARS.toFixed(2)} to join the queue.`);
      return;
    }

    setIsSubmitting(true);

    // TODO: Integrate with payment provider (Stripe, etc.)
    // For now, simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setHasJoined(true);
  };

  if (hasJoined) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            You&apos;re in the Queue
          </h3>
          <p className="mt-2 text-muted-foreground">
            Thank you for your support. A listener will connect with you shortly.
            Stay on this page — the chat will appear when someone is available.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Estimated wait: usually under 5 minutes when listeners are online.
          </p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Select or enter amount</Label>
            <RadioGroup
              value={selectedAmount}
              onValueChange={(v) => {
                setSelectedAmount(v);
                setError(null);
              }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-5"
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

            {selectedAmount === "custom" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="custom-amount">Amount (USD)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min={MINIMUM_DOLLARS}
                  step="0.01"
                  placeholder="1.00"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setError(null);
                  }}
                  className="max-w-[140px]"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-crisis">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Donate{" "}
                {selectedAmount === "custom"
                  ? customAmount
                    ? `$${getAmountInDollars().toFixed(2)}`
                    : `$${MINIMUM_DOLLARS}.00`
                  : `$${selectedAmount}`}{" "}
                & Join Queue
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
