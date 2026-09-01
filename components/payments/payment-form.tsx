"use client";

import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStripePromise } from "@/lib/stripe-client";

type CheckoutFormProps = {
  clientSecret: string;
  amountLabel: string;
  successUrl: string;
};

function CheckoutForm({ amountLabel, successUrl }: Omit<CheckoutFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error("Payment is still loading. Please try again.");
      return;
    }

    setProcessing(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: successUrl,
      },
    });

    if (result.error) {
      toast.error(result.error.message || "Payment failed.");
      setProcessing(false);
    }
    // On success Stripe redirects to return_url; nothing to do here.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || processing}
      >
        {processing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lock className="mr-2 h-4 w-4" />
        )}
        {processing ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </form>
  );
}

export default function PaymentForm({ clientSecret, amountLabel, successUrl }: CheckoutFormProps) {
  return (
    <Elements
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
      stripe={getStripePromise()}
    >
      <CheckoutForm amountLabel={amountLabel} successUrl={successUrl} />
    </Elements>
  );
}
