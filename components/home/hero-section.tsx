"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Radio } from "lucide-react";

const HERO_IMAGE = "/hero-candidate-3.jpg";
const HERO_ALT = "Black woman with headphones — a listening ear for our diverse community";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Single background image */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt={HERO_ALT}
          fill
          priority
          className="object-cover object-[38%_33%]"
          sizes="100vw"
        />
        {/* Rich dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35" />
        {/* Warm brand wash */}
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
      </div>

      {/* Foreground content */}
      <div className="container relative z-10 mx-auto flex min-h-screen items-center px-4 pt-20">
        <div className="max-w-xl">
          {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur-md animate-fade-in-up">
            <span className="mr-2 inline-block animate-wave">👋</span>
            A Listening Ear for Everyone 
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg animate-fade-in-up">
            Sometimes you just{" "}
            <span className="relative inline-block">
              <span className="relative z-10">need someone to truly hear you.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/60 -z-0 rounded" aria-hidden />
            </span>
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-pretty text-lg text-white/90 md:text-xl drop-shadow-md animate-fade-in-up animation-delay-100">
            Connect with a caring listener for a phone call or chat. No judgment, no pressure – just a genuine ear when you need it most.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center animate-fade-in-up animation-delay-200">
            <Link href="/book-listener">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-xl px-8 h-12 font-semibold bg-white text-primary shadow-lg shadow-black/20 border-0 hover:bg-white hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 active:translate-y-0 transition-[transform,box-shadow] duration-300 group btn-glow"
              >
                <Calendar className="mr-2 h-5 w-5 opacity-90" />
                Book a Listener
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/join-team">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl px-8 h-12 font-semibold border-2 border-white/80 bg-white/15 text-white shadow-lg backdrop-blur-md hover:bg-white/30 hover:border-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Our Team
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-stretch gap-6 animate-fade-in-up animation-delay-300">
            <div className="flex flex-col cursor-default transition-transform duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-white tracking-tight">5,000+</div>
              <div className="text-sm text-white/70 font-medium">People Helped</div>
            </div>
            <div className="w-px self-stretch bg-white/20" />
            <div className="flex flex-col cursor-default transition-transform duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-white tracking-tight">50+</div>
              <div className="text-sm text-white/70 font-medium">Trained Listeners</div>
            </div>
            <div className="w-px self-stretch bg-white/20" />
            <Link href="/community" className="flex flex-col group cursor-pointer transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                <div className="text-3xl font-bold text-white tracking-tight group-hover:text-white/80 transition-colors">Live</div>
              </div>
              <div className="flex items-center gap-1 text-sm text-white/70 font-medium group-hover:text-white/90 transition-colors">
                <Radio className="h-3.5 w-3.5" />
                Community Open
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
