import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Server-only Stripe client. Never import into client components.
 * Requires STRIPE_SECRET_KEY.
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

/** Fixed price for a paid listener conversation (in cents). */
export const LISTENER_PRICE_CENTS = 1099; // $10.99

/** Minimum donation (in cents) we accept. */
export const MIN_DONATION_CENTS = 100; // $1.00

/** Maximum donation (in cents) we accept. */
export const MAX_DONATION_CENTS = 100_000; // $1,000.00

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}
