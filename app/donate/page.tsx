import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Phone,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import DonationClient from "@/components/payments/donation-client";
import { site } from "@/lib/site";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Donate | Our Ears Are Open",
  description:
    "Support Our Ears Are Open's mission. Your donations fund conversations, Wi-Fi for the community, and local services for those in need.",
};

export const dynamic = "force-dynamic";

const suggestedAmounts = [
  {
    value: "25",
    label: "$25",
    impact: "Funds 2 conversations for someone in need",
  },
  {
    value: "50",
    label: "$50",
    impact: "Helps us become a 24/7 service",
  },
  {
    value: "100",
    label: "$100",
    impact: "Payments go to bill assistance, sent directly to different communities",
  },
  {
    value: "500",
    label: "$500",
    impact: "Assists with sponsoring a month of free services for all",
  },
];

export default async function DonatePage() {
  const donationsEnabled = await isFeatureEnabled("donations");
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        <div className="absolute inset-0">
          <Image
            src="/impact-photo.jpg"
            alt="Community impact"
            fill
            priority
            className="object-cover object-center opacity-25"
            sizes="100vw"
          />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-balance text-4xl font-bold text-primary-foreground md:text-5xl drop-shadow-md">
              Support Our Mission
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/85">
              Your generosity makes compassionate listening support accessible
              to those who need it most. Every dollar helps someone feel heard.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Donation Options */}
              <div className="lg:col-span-3">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Make a Donation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="one-time" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="one-time">One-Time</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      </TabsList>
                      <TabsContent value="one-time" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Make a one-time contribution to support our mission.
                        </p>
                      </TabsContent>
                      <TabsContent value="monthly" className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Recurring monthly giving is coming soon — for now,
                          please make a one-time donation using the form below.
                        </p>
                      </TabsContent>
                    </Tabs>

                    <Separator />

                    {donationsEnabled ? (
                      <DonationClient />
                    ) : (
                      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                        Donations are temporarily disabled. Please check back
                        soon.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Impact Sidebar */}
              <div className="lg:col-span-2">
                <Card className="sticky top-24 border-border bg-secondary">
                  <CardHeader>
                    <CardTitle>Your Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestedAmounts.map((amount) => (
                      <div
                        key={amount.value}
                        className="flex items-start gap-3 rounded-lg bg-background p-3"
                      >
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {amount.label}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {amount.impact}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Our Ears Are Open is a 501(c)(3) nonprofit. Your
                        donation is tax-deductible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where does your donation go */}
      <section className="bg-brown py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
              Where Does Your Donation Go?
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Your donations support our program and local services. We hire some
              of the most vulnerable people from all walks of life, ranging in
              age from 18 to 75. We understand both the dynamics of connecting
              people who are in need — not only mentally, but also financially.
            </p>

            <ul className="mt-8 space-y-6">
              <li className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">
                    Our team:
                  </span>{" "}
                  Every $10.99 that you pay goes to our team members&apos; pay.
                  Our priority will always be to hire the elderly, veterans,
                  single parents, college students, and those who need a second
                  chance. Some of our team members are elderly and may join our
                  team not only to alleviate the loneliness they experience, but
                  also to cover the extra payments for bills that Social Security
                  just doesn&apos;t cover. We also offer bill assistance to all
                  our team members. Not only do we provide these services to all
                  our team members, but also to our volunteers. We directly send
                  funds to the company for bill payments once assistance is
                  approved in our program.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">
                    Support for local charities:
                  </span>{" "}
                  We believe that local charities are the backbone of ensuring
                  people in need receive services immediately. Our goal will
                  always be to find impactful charities that go into communities,
                  hand out food, and provide financial assistance, and we will
                  always support those charities.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">
                    The Public:
                  </span>{" "}
                  In some conversations, we come across someone who may need an
                  extra boost. Whether it&apos;s a bill or professional therapy,
                  we will provide direct assistance to the company or merchant
                  for services rendered. This is based on an approved
                  application and fund availability.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">
                    Contact:
                  </span>{" "}
                  If you have any questions or concerns, you can certainly reach
                  out to us through email at{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {site.email}
                  </a>
                  . We do have a 24-hour return for e-mail responses.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Book a Listener / Chat CTA */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-10">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Need someone to listen?
            </h2>
            <p className="mt-2 text-muted-foreground">
              We offer phone and chat conversations with trained listeners.
              Book a conversation or join our community when a listener is
              available.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/book-listener">
                  <Phone className="mr-2 h-5 w-5" />
                  Book a Listener
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/community">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <blockquote className="text-xl font-medium italic text-primary-foreground md:text-2xl">
              &ldquo;You deserve care without earning it, rest without guilt, and
              healing without apology.&rdquo;
            </blockquote>
            <p className="mt-4 text-primary-foreground/90">
              — Amanda Fludd, LCSW-R
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
