import type { Metadata } from "next";
import { Settings, Bell, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings | Team Member Portal",
  description: "Team member settings.",
};

export default function TeamMemberSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email and in-app notification preferences.
              </p>
              <Button variant="outline" className="mt-4">
                Configure
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Change your password.
              </p>
              <Button variant="outline" className="mt-4">
                Update Password
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
