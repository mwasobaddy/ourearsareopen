import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Headphones,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnimatedWritingAvatar } from "@/components/animated-writing-avatar";
import { BookListenerFlow } from "@/components/book-listener/book-listener-flow";

export const metadata: Metadata = {
  title: "Book a Listener | Our Ears Are Open",
  description:
    "Take the first step toward peace. Book a 15-minute phone or chat conversation with a caring listener. Free option available.",
};

const steps = [
  { number: 1, label: "Conversation Type" },
  { number: 2, label: "What's on your mind" },
  { number: 3, label: "Listener preferences" },
  { number: 4, label: "Date & Time" },
  { number: 5, label: "Confirm" },
];

export default async function BookListenerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_complete")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.profile_complete) {
      redirect("/profile/setup?next=/book-listener");
    }
  }

  return (
    <>
      {/* Crisis Warning Banner */}
      <section className="bg-crisis/10 py-3">
        <div className="container mx-auto flex items-center justify-center gap-3 px-4 text-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-crisis" />
          <span className="text-sm text-foreground">
            If you are in immediate crisis, please{" "}
            <Link href="/crisis" className="font-medium text-crisis underline">
              click here for crisis resources
            </Link>{" "}
            or call 988.
          </span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-background py-14 md:py-20 lg:py-28">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="container relative mx-auto px-4">
          <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1 flex flex-col justify-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/10">
                <Headphones className="h-9 w-9" />
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[2.75rem]">
                Book a Listener
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-xl">
                Take the first step toward peace. Choose how you want to connect,
                share a little about what&apos;s on your mind, and pick a time
                that works for you. A caring listener will be there.
              </p>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end items-center w-full min-h-[420px] lg:min-h-[520px]">
              <div className="w-full min-w-[320px] max-w-full rounded-3xl ring-2 ring-primary/10 ring-offset-4 ring-offset-background shadow-2xl shadow-primary/10">
                <AnimatedWritingAvatar />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-3xl hidden md:flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {step.number}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mb-4 h-px w-8 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="bg-brown py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <BookListenerFlow />
          </div>
        </div>
      </section>
    </>
  );
}
