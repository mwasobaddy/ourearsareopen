import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import PaymentClient from "@/components/payments/payment-client";

export const metadata: Metadata = {
  title: "Payment | Our Ears Are Open",
  description: "Complete your booking payment securely with Our Ears Are Open.",
};

type Props = {
  searchParams: Promise<{ booking?: string; paid?: string }>;
};

export default async function PaymentPage({ searchParams }: Props) {
  const params = await searchParams;
  const bookingId = params.booking;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Payment requires a signed-in user.
  if (!user) {
    redirect("/login?next=/payment");
  }

  // No booking id -> nothing to pay for yet.
  if (!bookingId) {
    return (
      <section className="bg-background py-20">
        <div className="container mx-auto max-w-xl px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Nothing to pay</h1>
          <p className="mt-2 text-muted-foreground">
            You don&apos;t have a booking selected. Start a new booking first.
          </p>
          <Button asChild className="mt-6">
            <Link href="/book-listener">Book a listener</Link>
          </Button>
        </div>
      </section>
    );
  }

  // Fetch the booking to verify ownership + show context.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, type, status, concern, slot_start")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!booking) {
    return (
      <section className="bg-background py-20">
        <div className="container mx-auto max-w-xl px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Booking not found</h1>
          <p className="mt-2 text-muted-foreground">
            We couldn&apos;t find that booking for your account.
          </p>
          <Button asChild className="mt-6">
            <Link href="/book-listener">Back to booking</Link>
          </Button>
        </div>
      </section>
    );
  }

  const alreadyPaid = booking.status === "confirmed";

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/book-listener"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Booking
          </Link>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Complete Payment
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {alreadyPaid
              ? "This booking is already confirmed. No payment is needed."
              : "Your listener booking is almost confirmed. Complete payment to lock in your time."}
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {alreadyPaid ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                    <CheckCircle className="h-14 w-14 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Booking confirmed!
                    </h2>
                    <p className="max-w-md text-muted-foreground">
                      Your payment went through and your time is locked in. A
                      listener will be matched to you.
                    </p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                      <Button size="lg" asChild>
                        <Link href="/profile">View in Profile</Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/book-listener">Book another</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Securely enter your card details below. Your information is
                      encrypted end-to-end with Stripe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PaymentClient bookingId={bookingId} />
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 flex items-center gap-3 rounded-lg bg-secondary p-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Your payment is secure
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payments are processed by Stripe using industry-standard
                    encryption. We never see your card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="hidden lg:block">
              <Card className="sticky top-24 border-border">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="font-semibold text-foreground">
                      {booking.type === "phone"
                        ? "Phone conversation"
                        : "Chat conversation"}
                    </h4>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {booking.slot_start
                        ? `Scheduled ${new Date(
                            booking.slot_start,
                          ).toLocaleString()}`
                        : "Date & time from booking"}
                    </p>
                    {booking.concern && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        “{booking.concern}”
                      </p>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">$10.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Processing Fee
                      </span>
                      <span className="text-foreground">$0.00</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">$10.99</span>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    By completing payment, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms
                    </Link>{" "}
                    and cancellation policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
