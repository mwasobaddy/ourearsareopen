import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Add Listener | Admin | Our Ears Are Open",
  description: "Add a new team member (listener).",
};

export default function AdminListenersNewPage() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/listeners">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add listener</h1>
          <p className="text-muted-foreground">
            Create a new team member account. They will set their password on first sign-in.
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New team member</CardTitle>
          <p className="text-sm text-muted-foreground">
            Username is assigned by admin. Team member sets password on first login.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Jordan Lee" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="jordan.lee" />
            <p className="text-xs text-muted-foreground">
              Used for team member login at /team-member
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" placeholder="jordan@example.com" />
          </div>
          <Button>Create listener</Button>
        </CardContent>
      </Card>
    </>
  );
}
