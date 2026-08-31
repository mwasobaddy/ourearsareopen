import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  Lock,
  CheckCircle,
  ArrowLeft,
  Tag,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Payment | Our Ears Are Open",
  description:
    "Complete your booking payment securely with Our Ears Are Open.",
};

export default function PaymentPage() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
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
          <p className="mt-2 text-muted-foreground">
            Your listener booking is almost confirmed. Complete payment to lock in your time.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              {/* Order Summary (Mobile) */}
              <Card className="mb-6 border-border lg:hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Listener Conversation (15 min)
                      </span>
                      <span className="text-foreground">$10.99</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">$10.99</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup defaultValue="card" className="grid gap-4">
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex flex-1 items-center justify-between"
                      >
                        <span>Credit / Debit Card</span>
                        <div className="flex gap-2">
                          <div className="h-6 w-10 rounded bg-muted" />
                          <div className="h-6 w-10 rounded bg-muted" />
                          <div className="h-6 w-10 rounded bg-muted" />
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1">
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator />

                  {/* Card Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="John Doe" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM / YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" required />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Billing Address
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" placeholder="123 Main St" required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="City" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="State" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="12345" required />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Promo Code */}
                  <div className="space-y-2">
                    <Label htmlFor="promo" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Promo Code (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo"
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="mt-6 flex items-center gap-3 rounded-lg bg-secondary p-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Your payment is secure
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We use industry-standard encryption to protect your
                    information.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar (Desktop) */}
            <div className="hidden lg:block">
              <Card className="sticky top-24 border-border">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="font-semibold text-foreground">
                      Listener Booking
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      15-minute conversation · Phone or Chat
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>Matched by your preferences</p>
                      <p>Date & time from booking</p>
                    </div>
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
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-$0.00</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">$10.99</span>
                  </div>

                  <Button className="w-full" size="lg">
                    <Lock className="mr-2 h-4 w-4" />
                    Pay $10.99
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By completing payment, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/contact"
                      className="text-primary hover:underline"
                    >
                      Cancellation Policy
                    </Link>
                  </p>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <Card className="mt-4 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Free cancellation
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cancel up to 24 hours before your conversation for a
                        full refund.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Pay Button */}
          <div className="mt-6 lg:hidden">
            <Button className="w-full" size="lg">
              <Lock className="mr-2 h-4 w-4" />
              Pay $10.99
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              By completing payment, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline"
              >
                Cancellation Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
