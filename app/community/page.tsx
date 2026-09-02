import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  Heart,
  Users,
  CloudRain,
  TrendingUp,
  MessagesSquare,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Clock,
  Smile,
  Rainbow,
  UserPlus,
  Trophy,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatQueueWidget } from "@/components/community/chat-queue-widget";
import { getActiveContentRooms } from "@/lib/content";

export const metadata: Metadata = {
  title: "Community | Our Ears Are Open",
  description:
    "Join a community to share your losses and wins. Create your own community, celebrate milestones — no judgment, just community. 18+ only.",
};

const ICON_MAP: Record<string, { icon: typeof Heart; className: string }> = {
  trophy: {
    icon: Trophy,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  "messages-square": { icon: MessagesSquare, className: "bg-muted text-muted-foreground" },
  brain: { icon: Brain, className: "bg-primary/10 text-primary" },
  heart: { icon: Heart, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  users: { icon: Users, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "cloud-rain": { icon: CloudRain, className: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  "trending-up": { icon: TrendingUp, className: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" },
  rainbow: { icon: Rainbow, className: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  smile: { icon: Smile, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  star: { icon: Star, className: "bg-primary/10 text-primary" },
};

const DEFAULT_ROOM_META: Record<string, { members: number; activeNow: number; recentTopic: string }> = {
  wins: { members: 94, activeNow: 12, recentTopic: "First week of a new habit" },
  general: { members: 203, activeNow: 22, recentTopic: "What made you smile today?" },
  anxiety: { members: 124, activeNow: 8, recentTopic: "Managing work stress" },
  depression: { members: 98, activeNow: 5, recentTopic: "Finding small wins" },
  relationships: { members: 87, activeNow: 11, recentTopic: "Communication with a partner" },
  grief: { members: 52, activeNow: 3, recentTopic: "Grieving a parent" },
  "self-improvement": { members: 113, activeNow: 14, recentTopic: "Building a morning routine" },
  lgbtq: { members: 76, activeNow: 7, recentTopic: "Coming out experiences" },
};

const recentActivity = [
  {
    room: "Anxiety & Stress",
    message: "Finally said no to overtime this week. Small win but it felt huge!",
    time: "2 min ago",
    roomId: "anxiety",
  },
  {
    room: "General Chat",
    message: "Got the job I've been hoping for — had to share with people who get it!",
    time: "5 min ago",
    roomId: "general",
  },
  {
    room: "Self-Improvement",
    message: "Day 30 of my morning routine. Never thought I'd stick with it this long.",
    time: "8 min ago",
    roomId: "self-improvement",
  },
  {
    room: "Relationships",
    message: "Had a really honest conversation with my partner. Proud of us both.",
    time: "11 min ago",
    roomId: "relationships",
  },
  {
    room: "Wins & Milestones",
    message: "Just hit my first month of morning runs — so proud!",
    time: "15 min ago",
    roomId: "wins",
  },
];

const guidelines = [
  {
    icon: Heart,
    title: "Be Kind",
    description: "Treat everyone with empathy and respect. Celebrate each other.",
  },
  {
    icon: ShieldCheck,
    title: "Keep it Safe",
    description: "No sharing personal contact info, no harmful advice. This space is 18+ only.",
  },
  {
    icon: BookOpen,
    title: "Listen First",
    description: "We're here to hear each other — and to celebrate wins together.",
  },
  {
    icon: Smile,
    title: "You Belong Here",
    description: "Every identity, every background, every win is welcome in this community.",
  },
];

export default async function CommunityPage() {
  const dbRooms = await getActiveContentRooms();
  const rooms = dbRooms.map((room) => {
    const meta = DEFAULT_ROOM_META[room.slug] ?? {
      members: 0,
      activeNow: 0,
      recentTopic: "Join the conversation",
    };
    const visual = ICON_MAP[room.icon] ?? ICON_MAP["messages-square"];
    return {
      id: room.slug,
      icon: visual.icon,
      title: room.title,
      description: room.description ?? "",
      members: meta.members,
      activeNow: meta.activeNow,
      recentTopic: meta.recentTopic,
      colorClass: visual.className,
      borderClass: "hover:border-primary/40",
    };
  });
  const totalActive = rooms.reduce((acc, r) => acc + r.activeNow, 0);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/community-bg.jpg"
            alt="A group of diverse people connecting and supporting each other"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-primary/25" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/95 backdrop-blur-md mb-6">
              Join A Community
            </span>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
                <span className="mr-2 relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                {totalActive} people active right now
              </div>
              <span className="inline-flex items-center rounded-full border border-amber-400/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                18+ only — legal minimum age
              </span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
              Celebrate Yourself. Share Your Losses and Your Wins.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/85 md:text-xl drop-shadow-md">
              You deserve to be heard. This is your space to share achievements,
              create your own community, and celebrate milestones — no matter how
              big or small you think they are — with a community that gets it. No
              judgment, just community.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                asChild
              >
                <a href="#rooms">
                  <Users className="mr-2 h-5 w-5" />
                  Explore Community Rooms
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/70 bg-white/12 text-white hover:bg-white/25 backdrop-blur-md"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Queue Widget */}
      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                One-on-one support
              </p>
              <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
                Want to Talk to a Real Listener?
              </h2>
            </div>
            <ChatQueueWidget listenersAvailable={3} waitMinutes={5} />
          </div>
        </div>
      </section>

      {/* Support Rooms */}
      <section id="rooms" className="bg-brown py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Share & celebrate
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Community Rooms
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
            <p className="mt-6 text-lg text-muted-foreground">
              Find a room that fits you. Share milestones, Find Peace after grief,
              and meet like-minded people. Big and small — every room is a
              moderated safe space to be celebrated.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`group flex flex-col border-border bg-background card-hover transition-all duration-300 ${room.borderClass}`}
              >
                <CardContent className="flex flex-1 flex-col p-6">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${room.colorClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <room.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">{room.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground flex-1">
                    {room.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {room.members} members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {room.activeNow} online
                    </span>
                  </div>

                  <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Recent: </span>
                    &ldquo;{room.recentTopic}&rdquo;
                  </div>

                  <Link href="/register" className="mt-4 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300 bg-transparent"
                    >
                      Enter Room
                      <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Recent celebrations
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Wins Being Shared Right Now
              </h2>
              <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessagesSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {activity.room}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto shrink-0">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground line-clamp-2">
                      &ldquo;{activity.message}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/register">
                <Button variant="outline" size="lg" className="bg-transparent border-primary/40 text-primary hover:bg-primary/8">
                  Join to Share Your Wins (18+)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="bg-brown py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Our commitment to you
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Community Guidelines
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
            <p className="mt-6 text-muted-foreground">
              This is a safe, moderated space (18+). These values keep our
              community welcoming so everyone can share and celebrate.
            </p>
          </div>

          <div className="mx-auto max-w-3xl grid gap-5 sm:grid-cols-2">
            {guidelines.map((guideline) => (
              <div
                key={guideline.title}
                className="flex gap-4 rounded-xl border border-border bg-background p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <guideline.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {guideline.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {guideline.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
              Let&apos;s celebrate with you
            </h2>
            <p className="mx-auto mt-4 text-lg text-primary-foreground/80">
              Tell us all about your accomplishments, no matter how small or big
              you think they are. Let&apos;s celebrate you.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto group transition-all hover:shadow-lg hover:scale-105"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/book-listener">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto bg-transparent"
                >
                  Book a 1-on-1 Listener
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
