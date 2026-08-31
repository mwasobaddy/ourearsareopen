import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Listener Detail | Admin | Our Ears Are Open",
  description: "View and manage listener details.",
};

export default async function AdminListenerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Mock data — wire to GET /api/admin/listeners/:id
  const listener = {
    id,
    name: "Jordan Lee",
    username: "jordan.lee",
    email: "jordan@example.com",
    hoursThisWeek: 12,
    hoursThisMonth: 42,
    callsThisWeek: 18,
    chatsThisWeek: 6,
    status: "active",
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/listeners">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {listener.name}
            </h1>
            <Badge variant={listener.status === "active" ? "default" : "secondary"}>
              {listener.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">@{listener.username}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {listener.hoursThisWeek} / 15
            </p>
            <Progress
              value={(listener.hoursThisWeek / 15) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours this month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{listener.hoursThisMonth} hrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calls this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{listener.callsThisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chats this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{listener.chatsThisWeek}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Session list will be wired to API.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
