import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Appointments | Team Member Portal",
  description: "Your upcoming appointments.",
};

// Mock data
const upcomingAppointments = [
  { id: "1", consumer: "Alex M.", type: "Phone", date: "Today", time: "2:00 PM" },
  { id: "2", consumer: "Jordan D.", type: "Chat", date: "Today", time: "4:30 PM" },
  { id: "3", consumer: "Sam K.", type: "Phone", date: "Tomorrow", time: "10:00 AM" },
];

export default function TeamMemberAppointmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Your scheduled phone and chat sessions.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming
          </CardTitle>
          <Link href="/team-member/queue">
            <Button variant="outline" size="sm">
              No appointments? Join Chat Queue
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {apt.type === "Phone" ? (
                        <Phone className="h-5 w-5 text-primary" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{apt.consumer}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.date} at {apt.time}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {apt.type}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/session/${apt.id}`}>
                      {apt.type === "Phone" ? "Start Call" : "Open Chat"}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">No upcoming appointments</p>
              <p className="mt-1 text-sm">
                Jump into the chat queue when you&apos;re available.
              </p>
              <Link href="/team-member/queue">
                <Button className="mt-4">Join Chat Queue</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
