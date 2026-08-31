import type { Metadata } from "next";
import { MessageSquare, Users, ToggleLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Chat Queue | Team Member Portal",
  description: "Join the open chat queue and connect with consumers.",
};

export default function TeamMemberQueuePage() {
  // Mock state - in real app this would come from API
  const isAvailableForQueue = true;
  const waitingCount = 3;
  const hasNextInLine = true;
  const nextConsumer = "Alex M.";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat Queue</h1>
        <p className="text-muted-foreground">
          Accept chat sessions from consumers in the open queue.
        </p>
      </div>

      {/* Availability toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5" />
            Availability
          </CardTitle>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="queue-available">Available for queue</Label>
                <p className="text-sm text-muted-foreground">
                  When on, you can receive chat sessions from the open queue
                </p>
              </div>
              <Switch id="queue-available" defaultChecked={isAvailableForQueue} />
            </div>
          </CardContent>
        </CardHeader>
      </Card>

      {/* Queue status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Next in Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasNextInLine ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{nextConsumer}</p>
                    <p className="text-sm text-muted-foreground">
                      Waiting in chat queue
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {waitingCount} in queue
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Accept</Button>
                  <Button variant="outline">Decline</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">No one in queue right now</p>
              <p className="mt-1 text-sm">
                Stay available and you&apos;ll be notified when someone joins.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
