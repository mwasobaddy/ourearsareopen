import type { Metadata } from "next";
import { Link2, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-auth";
import { getContentRooms, getContentCrisis } from "@/lib/content";
import { RoomEditor } from "@/components/admin/room-editor";
import { CrisisEditor } from "@/components/admin/crisis-editor";

export const metadata: Metadata = {
  title: "Content | Admin — Our Ears Are Open",
  description: "Manage community rooms and crisis resources.",
};

export default async function AdminContentPage() {
  await requireAdmin();

  const [rooms, crisis] = await Promise.all([
    getContentRooms(),
    getContentCrisis(),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Content</h1>
      <p className="text-muted-foreground">
        Manage the community rooms shown on the community page and the crisis
        resources on the crisis page. Changes go live immediately on those
        public pages.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5" />
            Community rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoomEditor rooms={rooms.map((r) => ({ ...r }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Crisis resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrisisEditor links={crisis.map((c) => ({ ...c }))} />
        </CardContent>
      </Card>
    </>
  );
}
