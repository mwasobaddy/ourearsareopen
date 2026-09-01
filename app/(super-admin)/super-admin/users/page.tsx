import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChangeRoleSelect } from "@/components/super-admin/user-actions";
import { ToggleActiveButton } from "@/components/admin/listener-actions";

export const metadata: Metadata = {
  title: "Users & Roles | Super Admin | Our Ears Are Open",
  description: "Role assignment and user management.",
};

export default async function SuperAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSuperAdmin();
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  const users = (data ?? []).filter(
    (u) =>
      !query ||
      (u.full_name ?? "").toLowerCase().includes(query) ||
      (u.email ?? "").toLowerCase().includes(query),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
        <p className="text-muted-foreground">
          Promote or demote users between roles and deactivate/reactivate accounts.
        </p>
      </div>

      <form className="max-w-sm" action="/super-admin/users">
        <Input name="q" placeholder="Search by name or email…" defaultValue={q ?? ""} />
      </form>

      <Card>
        <CardHeader>
          <CardTitle>All users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Role</TableHead>
                <TableHead className="text-right">Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name ?? "—"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                      {user.role.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "outline" : "destructive"}>
                      {user.is_active ? "active" : "inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChangeRoleSelect
                      profileId={user.id}
                      currentRole={user.role}
                      isSelf={user.id === session.id}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id === session.id ? (
                      <Button variant="outline" size="sm" disabled>
                        You
                      </Button>
                    ) : (
                      <ToggleActiveButton
                        profileId={user.id}
                        isActive={user.is_active}
                        name={user.full_name ?? user.email}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
