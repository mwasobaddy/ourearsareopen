import type { Metadata } from "next";
import { FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Content | Admin — Our Ears Are Open",
  description: "Edit community rooms and crisis page content.",
};

export default function AdminContentPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Content</h1>
      <p className="text-muted-foreground">
        Edit community room titles, descriptions, and crisis page content.
      </p>
      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Community Rooms</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Page</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Community Rooms
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Wire to GET/PATCH /api/admin/content/rooms
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="room-title">Room Title</Label>
                <Input id="room-title" placeholder="e.g. Anxiety" />
              </div>
              <div>
                <Label htmlFor="room-desc">Description</Label>
                <Textarea id="room-desc" placeholder="Room description..." rows={3} />
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="crisis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-crisis" />
                Crisis Page Content
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Wire to GET/PATCH /api/content/crisis
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Edit crisis resources, links, and copy.
              </p>
              <Button className="mt-4">Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
