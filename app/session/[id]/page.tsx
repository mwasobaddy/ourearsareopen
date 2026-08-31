"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, PhoneOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SessionPage() {
  const params = useParams();
  const id = params.id as string;
  const { role } = useAuth();

  // Customer: join call/chat only (no dialer)
  // Listener: dialer (phone), extend, disconnect, debrief, notes, in-session booking
  const isListener = role === "listener";

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl px-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Session Room</CardTitle>
            <p className="text-sm text-muted-foreground">Session ID: {id}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">
                Session interface placeholder. Connect realtime (Twilio/LiveKit for voice, WebSocket for chat).
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isListener ? (
                <>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Call (Dialer)
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    Extend +5 min
                  </Button>
                  <Button variant="destructive" size="sm">
                    <PhoneOff className="mr-2 h-4 w-4" />
                    End Session
                  </Button>
                </>
              ) : (
                <>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Join Call
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Chat
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
