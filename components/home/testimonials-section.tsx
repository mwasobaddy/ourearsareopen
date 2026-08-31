"use client";

import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "@/hooks/use-in-view";

const testimonials = [
  {
    quote:
      "Our Ears Are Open helped me navigate my anxiety at work. Miss Lovely helped me understand that therapy isn't scary, and guided me to a therapist who could help me further.",
    name: "Sarah M.",
    role: "Client for 8 months",
    photo: "/testimonial-sarah.jpg",
    fallback: "S",
    stars: 5,
  },
  {
    quote:
      "The conversations I've had here have helped me grow more than I ever imagined. I drive trucks and JH has given me great advice on navigating trucking — and life's loneliness.",
    name: "James T.",
    role: "Community Member",
    photo: "/testimonial-james.jpg",
    fallback: "J",
    stars: 5,
  },
  {
    quote:
      "As a volunteer, I've seen first-hand the impact Our Ears Are Open has on our community. The team is dedicated and compassionate, and I'm proud to be part of it.",
    name: "Maria L.",
    role: "Community Volunteer",
    photo: "/testimonial-maria.jpg",
    fallback: "M",
    stars: 5,
  },
];

export function TestimonialsSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative bg-brown py-16 md:py-24 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden>
        <div className="h-full w-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="container relative mx-auto px-4" ref={ref}>
        {/* Header */}
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            Real Stories
          </span>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Stories of Hope
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Hear from our diverse community about what being truly heard has meant to them.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className={`group relative border-border bg-background shadow-sm interactive-card ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: isInView ? `${index * 150}ms` : "0ms" }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent className="p-6">
                {/* Stars */}
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <Quote className="mb-3 h-7 w-7 text-primary/25 transition-colors duration-300 group-hover:text-primary/45" />

                <p className="mb-6 text-muted-foreground italic leading-relaxed text-sm">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 border-t border-border pt-4">
                  {/* Profile photo */}
                  <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50">
                    <Image
                      src={testimonial.photo}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      onError={(e) => {
                        // Fallback handled by CSS
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
