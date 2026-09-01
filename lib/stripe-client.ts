"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

let _promise: Promise<Stripe | null> | null = null;

/** A memoized Stripe.js promise for the publishable key. */
export function getStripePromise(): Promise<Stripe | null> {
  if (!_promise) {
    _promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return _promise;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}
