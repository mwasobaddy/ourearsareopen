import type { Metadata } from "next";
import { FileText, Phone, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Session History | Team Member Portal",
  description: "Your past chat and phone sessions.",
};

// Mock data
const pastSessions = [
  { id: "1", consumer: "Alex M.", type: "Phone", date: "Mar 6, 2026", notes: true },
  { id: "2", consumer: "Jordan D.", type: "Chat", date: "Mar 5, 2026", notes: true },
  { id: "3", consumer: "Sam K.", type: "Phone", date: "Mar 4, 2026", notes: false },
];

export default function TeamMemberSessionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Session History</h1>
        <p className="text-muted-foreground">
          Past chat and phone sessions. Notes are shared with other team members.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Past Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {pastSessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {session.type === "Phone" ? (
                      <Phone className="h-5 w-5 text-primary" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{session.consumer}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {session.date} • {session.type}
                    </p>
                  </div>
                  {session.notes && (
                    <Badge variant="secondary">Has notes</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
