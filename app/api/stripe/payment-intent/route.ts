import { NextRequest, NextResponse } from "next/server";
import {
  getStripe,
  isStripeConfigured,
  LISTENER_PRICE_CENTS,
  MIN_DONATION_CENTS,
  MAX_DONATION_CENTS,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  type: z.enum(["booking", "donation"]),
  bookings_id: z.string().uuid().optional(),
  amount_cents: z.number().int().positive().optional(),
  currency: z.string().min(3).max(3).optional(),
});

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  // Resolve the signed-in user.
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let amountCents: number;
  let currency = "usd";

  if (parsed.type === "booking") {
    amountCents = LISTENER_PRICE_CENTS;
    if (!parsed.bookings_id) {
      return NextResponse.json(
        { error: "bookings_id is required for booking payments." },
        { status: 400 },
      );
    }
  } else {
    amountCents = parsed.amount_cents ?? MIN_DONATION_CENTS;
    if (amountCents < MIN_DONATION_CENTS || amountCents > MAX_DONATION_CENTS) {
      return NextResponse.json(
        { error: "Donation amount is outside the allowed range." },
        { status: 400 },
      );
    }
    currency = parsed.currency ?? "usd";
  }

  const admin = createAdminClient();
  const stripe = getStripe();

  // Grab the profile email so we can store / use it with Stripe.
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const customerEmail = profile?.email ?? user.email;

  // Reuse an existing Stripe customer for this user if one exists; otherwise
  // create one (idempotent per user).
  let customerId: string | null = null;
  const { data: existingPayment } = await admin
    .from("payments")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (existingPayment?.stripe_customer_id) {
    customerId = existingPayment.stripe_customer_id as string;
  } else {
    const customers = await stripe.customers.list({
      email: customerEmail ?? undefined,
      limit: 1,
    });
    const existing =
      customers.data.find((c) => c.email === customerEmail) ?? null;
    if (existing) {
      customerId = existing.id;
    } else {
      const customer = await stripe.customers.create({
        email: customerEmail ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      user_id: user.id,
      type: parsed.type,
      ...(parsed.bookings_id ? { bookings_id: parsed.bookings_id } : {}),
    },
  });

  // Record the payment in our ledger.
  const { data: paymentRow, error: insertError } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      bookings_id: parsed.bookings_id ?? null,
      type: parsed.type,
      amount_cents: amountCents,
      currency,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: customerId,
      status: "requires_payment_method",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Could not record the payment." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    paymentId: paymentRow.id,
    amountCents,
    currency,
  });
}
