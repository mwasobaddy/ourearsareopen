import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Donation Successful | Our Ears Are Open",
  description: "Thank you for your donation.",
};

export default async function DonateSuccessPage() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto max-w-xl px-4">
        <Card className="border-primary/30">
          <CardHeader className="items-center text-center">
            <Heart className="h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">Thank you for your gift</CardTitle>
            <CardDescription>
              Your donation makes compassionate listening support accessible to
              those who need it most. A receipt has been emailed to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Button size="lg" asChild className="w-full">
              <Link href="/book-listener">
                Book a conversation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
