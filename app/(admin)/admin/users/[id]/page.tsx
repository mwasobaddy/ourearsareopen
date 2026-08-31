import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "User Detail | Admin — Our Ears Are Open",
  description: "View consumer profile and session history.",
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Detail</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">Jordan Davis</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">jordan.davis@email.com</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>Active</Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" size="sm">Delete</Button>
              <Button variant="outline" size="sm">Reinstate</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Wire to GET /api/admin/sessions?userId=
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border p-3 text-sm">
                <p>Phone session · Jan 27, 2026</p>
                <p className="text-muted-foreground">With Team Member A</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
