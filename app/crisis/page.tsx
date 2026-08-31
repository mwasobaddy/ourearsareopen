import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  MessageSquare,
  Globe,
  Heart,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Crisis Help | Our Ears Are Open",
  description:
    "If you're in crisis, help is available. Find immediate support resources and crisis hotlines here.",
};

const crisisResources = [
  {
    name: "988 Suicide & Crisis Lifeline",
    description: "Free, confidential support 24/7 for people in distress",
    phone: "988",
    availability: "24/7",
    icon: Phone,
    primary: true,
  },
  {
    name: "Crisis Text Line",
    description: "Text HOME to 741741 for free crisis support",
    phone: "Text HOME to 741741",
    availability: "24/7",
    icon: MessageSquare,
    primary: false,
  },
  {
    name: "National Domestic Violence Hotline",
    description: "Support for those affected by domestic violence",
    phone: "1-800-799-7233",
    availability: "24/7",
    icon: Shield,
    primary: false,
  },
  {
    name: "Trevor Project (LGBTQ+ crisis support)",
    description: "24/7 crisis support for LGBTQ+ individuals",
    phone: "1-866-488-7386",
    availability: "24/7",
    icon: Heart,
    primary: false,
  },
  {
    name: "SAMHSA National Helpline",
    description:
      "Treatment referral service for mental health and substance use",
    phone: "1-800-662-4357",
    availability: "24/7",
    icon: Globe,
    primary: false,
  },
  {
    name: "Veterans Crisis Line",
    description: "Support for Veterans and their families",
    phone: "988, then press 1",
    availability: "24/7",
    icon: Shield,
    primary: false,
  },
];

const selfCareSteps = [
  {
    step: 1,
    title: "Breathe",
    description:
      "Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.",
  },
  {
    step: 2,
    title: "Ground Yourself",
    description:
      "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
  },
  {
    step: 3,
    title: "Reach Out",
    description:
      "Contact a trusted friend, family member, or one of the crisis lines listed above.",
  },
  {
    step: 4,
    title: "Stay Safe",
    description:
      "Remove yourself from any harmful situations. Go to a safe, comfortable place if possible.",
  },
];

export default function CrisisPage() {
  return (
    <>
      {/* Immediate Help Banner */}
      <section className="bg-crisis py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crisis-foreground/20">
              <AlertTriangle className="h-8 w-8 text-crisis-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-crisis-foreground md:text-4xl">
              You Are Not Alone
            </h1>
            <p className="mt-4 text-lg text-crisis-foreground/90">
              If you are in immediate danger, please call 911 or go to your
              nearest emergency room.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-crisis-foreground text-crisis hover:bg-crisis-foreground/90"
                asChild
              >
                <a href="tel:988">
                  <Phone className="mr-2 h-5 w-5" />
                  Call 988 Now
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-crisis-foreground/50 text-crisis-foreground hover:bg-crisis-foreground/10 bg-transparent"
                asChild
              >
                <a href="sms:741741&body=HOME">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Text HOME to 741741
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Hotlines */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Crisis Hotlines & Resources
              </h2>
              <p className="mt-2 text-muted-foreground">
                Free, confidential support available 24/7
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {crisisResources.map((resource) => (
                <Card
                  key={resource.name}
                  className={`border-2 ${
                    resource.primary ? "border-crisis bg-crisis/5" : "border-border"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          resource.primary ? "bg-crisis/20 text-crisis" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <resource.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {resource.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                        <div className="mt-3 flex items-center gap-4">
                          <a
                            href={`tel:${resource.phone.replace(/\D/g, "").slice(0, 10)}`}
                            className={`font-semibold ${
                              resource.primary ? "text-crisis" : "text-primary"
                            } hover:underline`}
                          >
                            {resource.phone}
                          </a>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {resource.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What To Do Section */}
      <section className="bg-brown py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                What To Do If You Are in Crisis
              </h2>
              <p className="mt-2 text-muted-foreground">
                Simple steps to help you through a difficult moment
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {selfCareSteps.map((step) => (
                <Card key={step.step} className="border-border bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety Information */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Alert className="border-primary/30 bg-primary/5">
              <CheckCircle className="h-5 w-5 text-primary" />
              <AlertTitle className="text-foreground">
                You took a brave step
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Visiting this page shows strength. Whether you are in crisis now
                or planning ahead, knowing your resources is important. You
                matter, and help is available.
              </AlertDescription>
            </Alert>

            <Card className="mt-8 border-border">
              <CardHeader>
                <CardTitle>Our Ears Are Open Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you are currently experiencing a crisis, please use the
                  resources above. During business hours (
                  {site.operatingHours.summary}), you can reach us through our
                  contact page or email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {site.email}
                  </a>
                  .
                </p>
                <div className="mt-4">
                  <Link href="/contact">
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Us
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  We are available {site.operatingHours.summary} (
                  {site.operatingHours.subtext}). For all inquiries, use our{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact page
                  </Link>{" "}
                  or email us at{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-primary hover:underline"
                  >
                    {site.email}
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Supportive Message */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Heart className="mx-auto h-12 w-12 text-primary-foreground/80" />
            <blockquote className="mt-6 text-xl font-medium text-primary-foreground italic">
              &ldquo;In the middle of difficulty lies opportunity.&rdquo;
            </blockquote>
            <p className="mt-2 text-primary-foreground/70">— Albert Einstein</p>
            <p className="mt-6 text-primary-foreground/80">
              Every day is a new chance. You have survived 100% of your worst
              days so far. Help is available, and healing is possible.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
