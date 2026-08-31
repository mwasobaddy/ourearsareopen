import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, AlertTriangle, Heart, Users } from "lucide-react";
import { ChatQueueDonationForm } from "@/components/chat-queue/chat-queue-donation-form";

export const metadata: Metadata = {
  title: "Open Queue Chat | Our Ears Are Open",
  description:
    "Join our open chat queue. Connect with the next available listener — minimum $1 donation. Donate what you can to help us grow.",
};

export default function ChatQueuePage() {
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-background to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquare className="h-8 w-8" />
              </div>
            </div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              Open Queue
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold text-foreground md:text-5xl">
              Chat with a Listener Now
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect with whoever&apos;s available — no scheduling, no waiting for a specific time.
              A trained listener will join you in chat as soon as one is free.
            </p>
          </div>
        </div>
      </section>

      {/* Open Queue Info + Donation */}
      <section className="bg-brown py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            {/* Key points */}
            <div className="mb-10 rounded-2xl border border-primary/20 bg-card/50 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-foreground">
                How the open queue works
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <Users className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span>
                    <strong className="text-foreground">Whoever&apos;s available</strong> — you don&apos;t choose who you speak with. The next available listener will connect with you.
                  </span>
                </li>
                <li className="flex gap-3">
                  <MessageSquare className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span>
                    <strong className="text-foreground">Chat only</strong> — open queue is for text chat. Phone conversations require scheduling.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Heart className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span>
                    <strong className="text-foreground">Donate what you can</strong> — minimum $1 to join the queue. Your support helps us grow toward free, 24/7 access for everyone.
                  </span>
                </li>
              </ul>
            </div>

            <ChatQueueDonationForm />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Prefer to schedule a conversation or choose your listener?{" "}
              <Link href="/book-listener" className="font-medium text-primary hover:underline">
                Book a Listener
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
