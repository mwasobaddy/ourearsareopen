import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Audit Log | Super Admin | Our Ears Are Open",
  description: "Trail of sensitive platform actions.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SuperAdminAuditPage() {
  await requireSuperAdmin();

  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_log")
    .select("id, action, actor_id, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const actorIds = Array.from(
    new Set((data ?? []).map((l) => l.actor_id).filter(Boolean) as string[]),
  );

  const emails = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: actors } = await admin
      .from("profiles")
      .select("id, email")
      .in("id", actorIds);
    for (const a of actors ?? []) emails.set(a.id, a.email);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          Sensitive actions (role changes, deactivations, config and flag edits).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity (latest 200)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>{emails.get(log.actor_id ?? "") ?? "—"}</TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.target_type ?? "—"}
                    {log.target_id ? ` · ${log.target_id.slice(0, 8)}` : ""}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {log.details
                      ? JSON.stringify(log.details)
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(data ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No audit events yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
