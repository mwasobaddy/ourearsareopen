import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Heart,
  Brain,
  Trophy,
  MessagesSquare,
  CloudRain,
  TrendingUp,
  Rainbow,
  Smile,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveContentRooms } from "@/lib/content";
import { ChatQueueWidget } from "@/components/community/chat-queue-widget";
import { getListenersAvailableCount } from "@/lib/session-ops";

export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, typeof Heart> = {
  trophy: Trophy,
  "messages-square": MessagesSquare,
  brain: Brain,
  heart: Heart,
  users: Users,
  "cloud-rain": CloudRain,
  "trending-up": TrendingUp,
  rainbow: Rainbow,
  smile: Smile,
  star: Star,
};

const DEFAULT_ROOM_META: Record<
  string,
  { members: number; activeNow: number; recentTopic: string }
> = {
  wins: { members: 94, activeNow: 12, recentTopic: "First week of a new habit" },
  general: {
    members: 203,
    activeNow: 22,
    recentTopic: "What made you smile today?",
  },
  anxiety: { members: 124, activeNow: 8, recentTopic: "Managing work stress" },
  depression: { members: 98, activeNow: 5, recentTopic: "Finding small wins" },
  relationships: {
    members: 87,
    activeNow: 11,
    recentTopic: "Communication with a partner",
  },
  grief: { members: 52, activeNow: 3, recentTopic: "Grieving a parent" },
  "self-improvement": {
    members: 113,
    activeNow: 14,
    recentTopic: "Building a morning routine",
  },
  lgbtq: { members: 76, activeNow: 7, recentTopic: "Coming out experiences" },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rooms = await getActiveContentRooms();
  const room = rooms.find((r) => r.slug === slug);
  if (!room) return { title: "Room not found" };
  return {
    title: `${room.title} | Community — Our Ears Are Open`,
    description: room.description ?? `Join the ${room.title} community room.`,
  };
}

export default async function CommunityRoomPage({ params }: Props) {
  const { slug } = await params;
  const rooms = await getActiveContentRooms();
  const room = rooms.find((r) => r.slug === slug);

  if (!room) notFound();

  const Icon = ICON_MAP[room.icon] ?? MessagesSquare;
  const meta = DEFAULT_ROOM_META[slug] ?? {
    members: 0,
    activeNow: 0,
    recentTopic: "Join the conversation",
  };
  const listenersAvailable = await getListenersAvailableCount();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{room.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {meta.members} members
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {meta.activeNow} online
              </span>
            </div>
          </div>
        </div>

        {room.description && (
          <p className="mt-4 text-muted-foreground">{room.description}</p>
        )}

        <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Recent topic: </span>
          &ldquo;{meta.recentTopic}&rdquo;
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Talk to a Listener
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Need to talk to someone right now? Connect with a trained listener for
          a one-on-one conversation.
        </p>
        <ChatQueueWidget
          listenersAvailable={listenersAvailable}
          waitMinutes={5}
        />
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Community rooms are coming soon
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time group chat for community rooms is under development. In the
          meantime, connect with a listener one-on-one or join the queue.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/book-listener">Book a Listener</Link>
          </Button>
          <Button asChild>
            <Link href="/chat-queue">Join Queue</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}