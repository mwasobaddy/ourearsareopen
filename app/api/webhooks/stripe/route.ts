import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingConfirmationEmail,
  sendSessionReceiptEmail,
} from "@/lib/email";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook handler.
 *
 * IMPORTANT: Stripe signs event payloads against the *raw* request body, so
 * we must NOT rely on Next's default JSON body parsing here. We read the raw
 * text and verify the signature with stripe.webhooks.constructEvent.
 *
 * Event types handled:
 *   - payment_intent.succeeded  -> mark the payment succeeded; confirm the
 *                                  linked (paid) booking.
 *   - payment_intent.payment_failed -> mark the payment failed.
 *   - payment_intent.canceled   -> mark the payment canceled.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret." },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await handleSucceeded(admin, pi);
  } else if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await admin
      .from("payments")
      .update({ status: "failed" })
      .eq("stripe_payment_intent_id", pi.id);
  } else if (event.type === "payment_intent.canceled") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await admin
      .from("payments")
      .update({ status: "canceled" })
      .eq("stripe_payment_intent_id", pi.id);
  }

  return NextResponse.json({ received: true });
}

async function handleSucceeded(
  admin: ReturnType<typeof createAdminClient>,
  pi: Stripe.PaymentIntent,
) {
  // Idempotency: if this payment is already recorded as succeeded, skip.
  const { data: existing } = await admin
    .from("payments")
    .select("id, status, bookings_id, type, user_id, amount_cents, currency")
    .eq("stripe_payment_intent_id", pi.id)
    .maybeSingle();

  if (!existing) {
    return;
  }
  if (existing.status === "succeeded") {
    return;
  }

  const charge = pi.latest_charge
    ? typeof pi.latest_charge === "string"
      ? pi.latest_charge
      : pi.latest_charge.id
    : null;

  let receiptUrl: string | null = null;
  if (charge) {
    const retrieved = await getStripe().charges.retrieve(charge);
    receiptUrl = retrieved.receipt_url ?? null;
  }

  await admin
    .from("payments")
    .update({
      status: "succeeded",
      receipt_url: receiptUrl,
    })
    .eq("id", existing.id);

  // Best-effort transactional emails (Resend). No-ops until RESEND_API_KEY is
  // configured; never breaks the webhook if sending fails.
  const payload = existing.type === "booking"
    ? await loadEmailContext(admin, existing.user_id, existing.bookings_id)
    : null;

  if (payload) {
    void sendBookingConfirmationEmail({
      to: payload.email,
      first_name: payload.firstName,
      type: payload.type,
      slot_start: payload.slotStart,
      listener_name: payload.listenerName,
    });

    void sendSessionReceiptEmail({
      to: payload.email,
      first_name: payload.firstName,
      amount: formatAmount(existing.amount_cents, existing.currency),
    });
  }

  // For paid bookings, confirm the booking once funds are captured.
  if (existing.type === "booking" && existing.bookings_id) {
    await admin
      .from("bookings")
      .update({ status: "confirmed", payment_intent_id: pi.id })
      .eq("id", existing.bookings_id)
      .eq("payment_option", "paid");
  }
}

type EmailContext = {
  email: string;
  firstName: string;
  type: string;
  slotStart: string | null;
  listenerName: string | null;
};

async function loadEmailContext(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  bookingsId: string | null,
): Promise<EmailContext | null> {
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.email) return null;

    let type = "conversation";
    let slotStart: string | null = null;
    let listenerName: string | null = null;

    if (bookingsId) {
      const { data: booking } = await admin
        .from("bookings")
        .select("type, slot_start, listener_id")
        .eq("id", bookingsId)
        .maybeSingle();
      if (booking) {
        type = booking.type;
        slotStart = booking.slot_start;
        if (booking.listener_id) {
          const { data: listener } = await admin
            .from("profiles")
            .select("full_name")
            .eq("id", booking.listener_id)
            .maybeSingle();
          listenerName = listener?.full_name ?? null;
        }
      }
    }

    const firstName = (profile.full_name ?? "").trim().split(/\s+/)[0] || "there";
    return { email: profile.email, firstName, type, slotStart, listenerName };
  } catch {
    return null;
  }
}

function formatAmount(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$ ${(cents / 100).toFixed(2)}`;
  }
}
