"use client";

import Image from "next/image";
import { Heart, Shield, Users, CheckCircle } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const missionPoints = [
  {
    icon: Heart,
    title: "Compassionate Listening",
    description:
      "Every conversation is approached with empathy, understanding, and genuine respect.",
  },
  {
    icon: Shield,
    title: "Safe & Confidential",
    description:
      "Your privacy matters. All conversations are completely confidential and secure.",
  },
  {
    icon: Users,
    title: "Inclusive & Diverse",
    description:
      "We celebrate diversity and provide culturally sensitive support that honors every identity.",
  },
];

const highlights = [
  "Free option always available",
  "No therapy — we are listeners",
  "Flexible scheduling 7 days a week",
  "Minority-owned & community-rooted",
];

export function MissionSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="bg-brown pt-12 md:pt-16 pb-4 md:pb-6 overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Two-column: text left, photo right */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text column */}
          <div
            className={`transition-all duration-700 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              Our Mission
            </span>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl leading-tight">
              A listening ear for every story, every background,{" "}
              <span className="text-primary">every struggle.</span>
            </h2>
            <p className="mt-5 text-pretty text-lg text-muted-foreground leading-relaxed">
              We believe the most powerful gift you can give someone is to truly
              hear them. Our Ears Are Open connects you with trained listeners —
              real people who care, from all walks of life, just like you.
            </p>

            {/* Highlight pills */}
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Three value cards */}
            <div className="mt-10 space-y-4">
              {missionPoints.map((card, index) => (
                <div
                  key={card.title}
                  className={`group flex items-start gap-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm interactive-card ${
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: isInView ? `${200 + index * 120}ms` : "0ms" }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo column */}
          <div
            className={`relative transition-all duration-700 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            style={{ transitionDelay: isInView ? "150ms" : "0ms" }}
          >
            {/* Main photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 aspect-[4/5] transition-transform duration-500 hover:scale-[1.02]">
              <Image
                src="/mission-photo.jpg"
                alt="Elderly Black person in a moment of reflection — why someone reaches out for a listening ear"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Warm overlay for brand cohesion */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />

              {/* Floating stat card */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">5,000+</div>
                    <div className="text-sm text-muted-foreground">People heard this year</div>
                  </div>
                  <div className="h-px flex-1 mx-4 bg-border" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">50+</div>
                    <div className="text-sm text-muted-foreground">Caring listeners</div>
                  </div>
                  <div className="h-px flex-1 mx-4 bg-border" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Confidential</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative accent circle */}
            <div
              className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-primary/15 -z-10"
              aria-hidden
            />
            <div
              className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-accent -z-10"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
