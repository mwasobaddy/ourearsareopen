"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Users } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

export function DonateSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24" ref={ref}>
      {/* Background photo with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/impact-photo.jpg"
          alt="Black volunteers and community members giving back — food bank, volunteering, charitable support"
          fill
          className="object-cover object-center opacity-20"
          sizes="100vw"
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary-foreground/5 animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-primary-foreground/5 animate-pulse-soft animation-delay-300" />
        <div className="absolute top-1/2 right-1/3 h-32 w-32 rounded-full bg-primary-foreground/5 animate-float" />
      </div>

      <div className="container relative mx-auto px-4">
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 animate-bounce-gentle">
            <Heart className="h-8 w-8 text-primary-foreground animate-pulse-soft" />
          </div>
          <h2 className="text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
            Support Our Mission
          </h2>
          <p className="mt-4 text-pretty text-lg text-primary-foreground/85">
            Your donations help us provide accessible conversations to those who
            need them most. Every contribution makes a real difference in
            someone&apos;s life.
          </p>

          <div
            className={`mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-200 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Link href="/donate">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto group transition-all duration-300 hover:shadow-lg hover:scale-105 btn-glow"
              >
                Donate Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/15 sm:w-auto bg-transparent transition-all duration-300 hover:scale-105"
              >
                <Users className="mr-2 h-4 w-4" />
                Become a Volunteer
              </Button>
            </Link>
          </div>

          {/* Impact stats */}
          <div
            className={`mt-10 grid grid-cols-3 gap-8 transition-all duration-700 delay-300 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {[
              { amount: "$25", desc: "Funds 2 conversations for someone in need" },
              { amount: "$50", desc: "Helps us become a 24/7 service" },
              { amount: "$100", desc: "$100 payments go to Bill Assistance, sent directly to different communities" },
            ].map((item, index) => (
              <div
                key={item.amount}
                className="group cursor-default rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 px-6 py-4 transition-all duration-300 hover:scale-105 hover:border-primary-foreground/40 hover:bg-primary-foreground/10"
                style={{ transitionDelay: isInView ? `${400 + index * 100}ms` : "0ms" }}
              >
                <div className="text-3xl font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                  {item.amount}
                </div>
                <div className="text-sm text-primary-foreground/70">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
