import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-auth";
import { AddListenerForm } from "@/components/admin/listener-actions";

export const metadata: Metadata = {
  title: "Add Listener | Admin | Our Ears Are Open",
  description: "Add a new team member (listener).",
};

export default async function AdminListenersNewPage() {
  await requireAdmin();
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
            Create a new team member account. They will set their password on
            first sign-in.
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New team member</CardTitle>
          <p className="text-sm text-muted-foreground">
            The account is created on sign-up with the listener role. Password
            + email flows are managed by Supabase (client-configured).
          </p>
        </CardHeader>
        <CardContent>
          <AddListenerForm requiresAuthUser />
        </CardContent>
      </Card>
    </>
  );
}
