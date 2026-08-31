"use client";

import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/hooks/use-in-view";

const panels = [
  {
    src: "/hero-bg.jpg",
    alt: "Diverse minority listeners from our team — Black, Asian, Muslim, and more",
    label: "Our Listeners",
    sub: "50+ trained volunteers & staff",
    href: "/join-team",
  },
  {
    src: "/community-bg.jpg",
    alt: "Diverse community members including minorities supporting each other",
    label: "Our Community",
    sub: "5,000+ people heard",
    href: "/community",
  },
  {
    src: "/mission-photo.jpg",
    alt: "Group of 5 diverse listeners — Black, Muslim woman in hijab, Asian, supporting our community",
    label: "Inclusive Support",
    sub: "Every identity welcome",
    href: "/about",
  },
];

export function PhotoStrip() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section className="bg-background py-0 overflow-hidden" ref={ref}>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {panels.map((panel, index) => (
          <Link
            key={panel.src}
            href={panel.href}
            className={`group relative h-64 md:h-80 overflow-hidden block transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: isInView ? `${index * 100}ms` : "0ms" }}
          >
            <Image
              src={panel.src}
              alt={panel.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-300 group-hover:from-primary/70 group-hover:via-primary/30" />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="font-bold text-white text-xl drop-shadow-md transition-transform duration-300 group-hover:-translate-y-1">
                {panel.label}
              </div>
              <div className="mt-1 text-sm text-white/80 transition-transform duration-300 group-hover:-translate-y-1" style={{ transitionDelay: "50ms" }}>
                {panel.sub}
              </div>
            </div>

            {/* Arrow indicator on hover */}
            <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm group-hover:bg-white/30">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
