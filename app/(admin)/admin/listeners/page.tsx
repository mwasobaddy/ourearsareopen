import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Listeners | Admin | Our Ears Are Open",
  description: "Manage team members (listeners).",
};

const mockListeners = [
  { id: "1", name: "Jordan Lee", username: "jordan.lee", hoursThisWeek: 12, status: "active" },
  { id: "2", name: "Alex Smith", username: "alex.smith", hoursThisWeek: 15, status: "active" },
  { id: "3", name: "Morgan Davis", username: "morgan.davis", hoursThisWeek: 8, status: "active" },
  { id: "4", name: "Sam Wilson", username: "sam.wilson", hoursThisWeek: 0, status: "inactive" },
];

export default function AdminListenersPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listeners</h1>
          <p className="text-muted-foreground">
            Manage team members (listeners)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/listeners/new">
            <Plus className="mr-2 h-4 w-4" />
            Add listener
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add, edit, or deactivate listeners. 15 hr/week cap applies.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Hours this week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockListeners.map((listener) => (
                <TableRow key={listener.id}>
                  <TableCell className="font-medium">{listener.name}</TableCell>
                  <TableCell>{listener.username}</TableCell>
                  <TableCell>
                    {listener.hoursThisWeek} / 15 hrs
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        listener.status === "active" ? "default" : "secondary"
                      }
                    >
                      {listener.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/listeners/${listener.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
