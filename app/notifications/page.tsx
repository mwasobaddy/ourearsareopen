import type { Metadata } from "next";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export const metadata: Metadata = {
  title: "Notifications | Our Ears Are Open",
  description: "Your notifications.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="text-center">
            <CardContent className="p-10">
              <p className="text-muted-foreground">
                Please log in to view your notifications.
              </p>
              <Link href="/login">
                <Button className="mt-4">Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const admin = createAdminClient();
  const { data: notifications } = await admin
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = (notifications ?? []).filter((n) => !n.read_at).length;

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && <MarkAllReadButton />}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!notifications || notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <BellOff className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-lg border p-4 ${
                      n.read_at ? "border-border" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{n.title}</p>
                      {!n.read_at && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {n.body ? (
                      <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                    {n.link ? (
                      <Link href={n.link}>
                        <Button variant="link" size="sm" className="mt-1 px-0">
                          View
                        </Button>
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}