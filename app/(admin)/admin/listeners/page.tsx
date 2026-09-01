import type { Metadata } from "next";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllListenerStats, HOURS_CAP } from "@/lib/admin-data";
import { ToggleActiveButton } from "@/components/admin/listener-actions";

export const metadata: Metadata = {
  title: "Listeners | Admin | Our Ears Are Open",
  description: "Manage team members (listeners).",
};

export default async function AdminListenersPage() {
  await requireAdmin();
  const listeners = await getAllListenerStats();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listeners</h1>
          <p className="text-muted-foreground">
            Manage team members (listeners) and monitor their hours
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
            Weekly hours are computed from real completed sessions. The{" "}
            {HOURS_CAP} hr/week cap applies (1099).
          </p>
        </CardHeader>
        <CardContent>
          {listeners.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">No listeners yet</p>
              <p className="mt-1 text-sm">
                Add your first team member to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-40">Hours this week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listeners.map((listener) => {
                  const over = listener.hoursThisWeek > HOURS_CAP;
                  return (
                    <TableRow key={listener.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/listeners/${listener.id}`}
                          className="hover:underline"
                        >
                          {listener.full_name ?? listener.email}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {listener.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(
                              100,
                              (listener.hoursThisWeek / HOURS_CAP) * 100,
                            )}
                            className="h-2 w-24"
                          />
                          <span className="text-sm">
                            {listener.hoursThisWeek} / {HOURS_CAP}
                          </span>
                        </div>
                        {over && (
                          <span className="mt-1 flex items-center gap-1 text-xs text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            Over cap
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={listener.is_active ? "default" : "secondary"}
                        >
                          {listener.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/listeners/${listener.id}`}>
                              View
                            </Link>
                          </Button>
                          <ToggleActiveButton
                            profileId={listener.id}
                            isActive={listener.is_active}
                            name={listener.full_name ?? listener.email}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
