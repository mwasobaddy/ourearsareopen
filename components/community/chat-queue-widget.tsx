"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, Clock, ArrowRight, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ChatQueueWidgetProps {
  listenersAvailable?: number;
  waitMinutes?: number;
  compact?: boolean;
}

const CHAT_QUEUE_URL = "/chat-queue";
const BOOK_LISTENER_URL = "/book-listener";
const REGISTER_URL = "/register";

export function ChatQueueWidget({
  listenersAvailable = 3,
  waitMinutes = 5,
  compact = false,
}: ChatQueueWidgetProps) {
  const isAvailable = listenersAvailable > 0;
  const { isAuthenticated } = useAuth();

  const connectHref = isAuthenticated ? CHAT_QUEUE_URL : `${REGISTER_URL}?returnUrl=${encodeURIComponent(CHAT_QUEUE_URL)}`;

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <span className="relative flex h-3 w-3 shrink-0">
          {isAvailable && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isAvailable ? "bg-emerald-400" : "bg-muted-foreground"
            }`}
          />
        </span>
        <span className="text-sm font-medium text-foreground">
          {isAvailable
            ? `${listenersAvailable} listener${listenersAvailable !== 1 ? "s" : ""} available now`
            : "No listeners available right now"}
        </span>
        {isAvailable && (
          <Badge variant="secondary" className="text-xs ml-auto shrink-0">
            &lt; {waitMinutes} min wait
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left — status */}
          <div className="flex items-start gap-5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Headphones className="h-7 w-7 text-primary" />
              {isAvailable && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400 border-2 border-background" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {isAvailable ? "Listeners Available Now" : "Check Back Soon"}
                </h3>
                {isAvailable && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400">
                    Live
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-muted-foreground">
                {isAvailable ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {listenersAvailable} trained listener
                      {listenersAvailable !== 1 ? "s" : ""}
                    </span>{" "}
                    ready to connect with you right now
                  </>
                ) : (
                  "Our listeners will be back shortly. Schedule a time or join the community while you wait."
                )}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {isAvailable && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    Estimated wait: &lt; {waitMinutes} minutes
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Open queue · $1 minimum donation
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Account required. By connecting, you agree to our terms and conditions.
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Free chat appointments available if you&apos;re unable to make a $1 donation. No judgement.
                </span>
              </div>
            </div>
          </div>

          {/* Right — CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:min-w-[180px]">
            <Link href={connectHref} className="w-full">
              <Button
                size="lg"
                className="w-full group"
                disabled={!isAvailable}
              >
                Connect Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href={BOOK_LISTENER_URL} className="w-full">
              <Button variant="outline" size="lg" className="w-full gap-2 bg-transparent">
                <Calendar className="h-4 w-4" />
                Schedule for Later
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
