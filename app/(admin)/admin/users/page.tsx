import type { Metadata } from "next";
import Link from "next/link";
import { UserCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ToggleActiveButton } from "@/components/admin/listener-actions";

export const metadata: Metadata = {
  title: "Users | Admin — Our Ears Are Open",
  description: "Manage consumer profiles, search, view, deactivate, reinstate.",
};

type SearchParams = Promise<{ q?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const search = (q ?? "").toLowerCase().trim();
  const filtered = (users ?? []).filter(
    (u) =>
      !search ||
      (u.full_name ?? "").toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search),
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage consumer profiles. Search, view, deactivate, and reinstate.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <form method="get" className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </form>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <UserCircle className="mx-auto mb-4 h-14 w-14 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.full_name ?? user.email}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "default" : "secondary"}
                      >
                        {user.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>View</Link>
                        </Button>
                        <ToggleActiveButton
                          profileId={user.id}
                          isActive={user.is_active}
                          name={user.full_name ?? user.email}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
