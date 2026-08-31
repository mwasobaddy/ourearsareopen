"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  HandHeart,
  ArrowRight,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const services = [
  {
    icon: Phone,
    title: "Phone Conversation",
    description:
      "One-on-one scheduled phone conversation with a trained listener for 15 minutes. Real talk, real support. No worries if you need to talk longer; sometimes you need it.",
    href: "/book-listener",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MessageSquare,
    title: "Chat Conversation",
    description:
      "Connect with a listener through a scheduled or live chat — comfortably, privately, and at your own pace.",
    href: "/book-listener",
    color: "bg-accent/60 text-primary",
  },
  {
    icon: AlertTriangle,
    title: "Crisis Care",
    description:
      "We do not provide immediate crisis care, but we offer guidance to connect you with the right resources fast.",
    href: "/crisis",
    color: "bg-crisis/10 text-crisis",
  },
  {
    icon: HandHeart,
    title: "Volunteer & Give Back",
    description:
      "Make a difference in your community by volunteering your time or supporting our nonprofit mission.",
    href: "/volunteer",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join peer support rooms, share your story, and find connection with others going through similar experiences.",
    href: "/community",
    color: "bg-secondary text-primary",
  },
];

export function ServicesSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative bg-brown py-12 md:py-16 overflow-hidden">
      {/* Background image — community support, giving back. Light overlay for WCAG contrast (dark text on light bg). */}
      <div className="absolute inset-0">
        <Image
          src="/services-bg.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-[0.14]"
          sizes="100vw"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/40 via-brown/88 to-brown/92"
          aria-hidden
        />
      </div>

      <div className="container relative mx-auto px-4" ref={ref}>
        <div className={`mx-auto max-w-3xl text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Accessible, compassionate listening support through phone and chat — no judgment, no pressure, always free of shame.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={`group flex flex-col border-border bg-background interactive-card ${
                isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: isInView ? `${index * 100}ms` : '0ms' }}
            >
              <CardContent className="flex-1 p-6">
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${service.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg`}
                >
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Link href={service.href} className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 group-hover:translate-x-1"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
