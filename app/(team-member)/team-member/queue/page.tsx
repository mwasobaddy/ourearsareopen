import type { Metadata } from "next";
import { QueuePanel } from "@/components/team-member/queue-panel";

export const metadata: Metadata = {
  title: "Chat Queue | Team Member Portal",
  description: "Join the open chat queue and connect with consumers.",
};

export default function TeamMemberQueuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat Queue</h1>
        <p className="text-muted-foreground">
          Accept chat sessions from consumers in the open queue.
        </p>
      </div>
      <QueuePanel />
    </div>
  );
}
