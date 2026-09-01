import type { Metadata } from "next";
import { Bell, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSuperAdmin } from "@/lib/super-admin-auth";

export const metadata: Metadata = {
  title: "Notifications | Super Admin | Our Ears Are Open",
  description: "Email and SMS notification configuration.",
};

const channels = [
  {
    icon: Mail,
    name: "Email (transactional)",
    detail: "Booking confirms, reminders, receipts, post-session synopsis, password reset.",
    status: "needs Resend",
  },
  {
    icon: Phone,
    name: "SMS (Twilio)",
    detail: "Scheduled phone-session reminders and listener alerts.",
    status: "needs Twilio",
  },
  {
    icon: Bell,
    name: "In-app notifications",
    detail: "Optional in-app notification center for team members.",
    status: "deferred",
  },
];

export default async function SuperAdminNotificationsPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Outbound notification providers and templates.
        </p>
      </div>

      <div className="space-y-4">
        {channels.map((c) => (
          <Card key={c.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <c.icon className="h-5 w-5" />
                {c.name}
                <Badge variant="secondary">{c.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{c.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Email/SMS sending depends on client-provided credentials (Resend API
          key + verified domain, Twilio account) listed in the launch checklist.
          Once those are in place, templates can be authored and tested in
          Module 11.
        </CardContent>
      </Card>
    </div>
  );
}
