"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, MessageSquare, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";

const steps = [
  {
    step: 1,
    icon: ClipboardList,
    title: "Tell us about yourself",
    description:
      "Sign up for free and complete a brief questionnaire so we can match you with the right listener.",
    image: "/howitworks-step1.jpg",
    imageAlt: "Woman at home completing questionnaire on laptop — face visible",
    objectPosition: "top center",
  },
  {
    step: 2,
    icon: MessageSquare,
    title: "Connect with a listener",
    description:
      "Choose a phone or chat conversation from the comfort of your home, on your schedule.",
    image: "/howitworks-step2.jpg",
    imageAlt: "Man wearing headset on video call with listener — face visible",
    objectPosition: "center",
  },
  {
    step: 3,
    icon: Heart,
    title: "Talk freely",
    description:
      "Open up in a safe, judgment-free space. We're here to listen — never to judge.",
    image: "/connect-listener.jpg",
    imageAlt: "Woman opening up during remote chat in comfortable space — face visible",
    objectPosition: "top center",
  },
];

export function HowItWorksSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="bg-background pt-0 pb-8 md:pb-12 overflow-hidden">
      {/* How It Works heading — no background photo */}
      <div className="relative w-full mb-8 py-12 md:py-16">
        <div className="flex flex-col items-center justify-center text-center px-4">
          <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-3">
            Simple • Caring • Confidential
          </span>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground max-w-xl">
            Three easy steps to connect with a listening ear from anywhere.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4" ref={ref}>
        {/* Steps — photo cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className={`group relative rounded-2xl overflow-hidden shadow-lg border border-border interactive-card ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: isInView ? `${index * 150}ms` : "0ms" }}
            >
              {/* Step photo — taller to show full image */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.imageAlt ?? item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: item.objectPosition ?? "center" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                {/* Step number badge */}
                <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                  {item.step}
                </div>
              </div>

              {/* Card body */}
              <div className="bg-card p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA below steps */}
        <div
          className={`mt-8 text-center transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: isInView ? "500ms" : "0ms" }}
        >
          <Link href="/book-listener">
            <Button size="lg" className="rounded-xl px-8 font-semibold group btn-glow">
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
