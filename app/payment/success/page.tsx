import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Successful | Our Ears Are Open",
  description: "Your payment was successful.",
};

export default async function PaymentSuccessPage() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto max-w-xl px-4">
        <Card className="border-primary/30">
          <CardHeader className="items-center text-center">
            <CheckCircle className="h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">Payment successful</CardTitle>
            <CardDescription>
              Thank you! Your booking has been confirmed and a listener will be
              matched to you shortly. A receipt has been emailed to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Button size="lg" asChild className="w-full">
              <Link href="/profile">
                View my bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full">
              <Link href="/book-listener">Book another conversation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
