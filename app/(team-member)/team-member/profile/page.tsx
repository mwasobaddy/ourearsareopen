import type { Metadata } from "next";
import { User, Clock, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";

export const metadata: Metadata = {
  title: "Profile | Team Member Portal",
  description: "Your team member profile.",
};

// Mock data
const profile = {
  name: "Sarah Johnson",
  role: "Team Member",
  hoursThisWeek: 8.5,
  hoursThisMonth: 32,
  callsThisWeek: 12,
  chatsThisWeek: 18,
};

export default function TeamMemberProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Your team member profile and summary.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                SJ
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <Badge variant="secondary" className="mt-2">
                {profile.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Hours This Week"
          value={profile.hoursThisWeek}
          description="of 15 hr cap"
          icon="Clock"
        />
        <StatsCard
          title="Hours This Month"
          value={profile.hoursThisMonth}
          description="Total"
          icon="Clock"
        />
        <StatsCard
          title="Calls This Week"
          value={profile.callsThisWeek}
          description="Phone sessions"
          icon="Phone"
        />
        <StatsCard
          title="Chats This Week"
          value={profile.chatsThisWeek}
          description="Chat sessions"
          icon="MessageSquare"
        />
      </div>
    </div>
  );
}
