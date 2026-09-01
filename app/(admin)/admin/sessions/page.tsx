import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { SessionsFilter } from "@/components/admin/sessions-filter";

export const metadata: Metadata = {
  title: "Sessions | Admin | Our Ears Are Open",
  description: "Monitor all chat and phone sessions.",
};

const STATUS_STYLES: Record<string, "default" | "secondary" | "outline"> = {
  completed: "secondary",
  active: "default",
  ended: "outline",
  left: "outline",
  pending: "outline",
};

type SearchParams = Promise<{ q?: string; status?: string; type?: string }>;

function duration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "—";
  const mins = Math.round(ms / 60_000);
  return `${mins} min`;
}

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { q, status, type } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("sessions")
    .select(
      "id, mode, status, started_at, ended_at, notes, listener_id, profiles:user_id(full_name), sessions_listener_id_fkey(full_name)",
    )
    .order("started_at", { ascending: false })
    .limit(100);

  if (status && status !== "all")
    query = query.eq(
      "status",
      status as Database["public"]["Enums"]["session_status"],
    );
  if (type && type !== "all")
    query = query.eq("mode", type as Database["public"]["Enums"]["session_mode"]);

  const { data: sessions } = await query;

  const search = (q ?? "").toLowerCase().trim();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          Monitor all chat and phone sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All sessions</CardTitle>
            <SessionsFilter
              query={q ?? ""}
              status={status ?? "all"}
              type={type ?? "all"}
            />
          </div>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No sessions match.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Consumer</TableHead>
                  <TableHead>Listener</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions
                  .filter((s) => {
                    if (!search) return true;
                    const customer = Array.isArray(s.profiles)
                      ? s.profiles[0]
                      : s.profiles;
                    return (
                      (customer?.full_name ?? "")
                        .toLowerCase()
                        .includes(search) ||
                      (customer?.email ?? "")
                        .toLowerCase()
                        .includes(search)
                    );
                  })
                  .map((s) => {
                    const customer = Array.isArray(s.profiles)
                      ? s.profiles[0]
                      : s.profiles;
                    const listener = Array.isArray(
                      s.sessions_listener_id_fkey,
                    )
                      ? s.sessions_listener_id_fkey[0]
                      : s.sessions_listener_id_fkey;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          {s.started_at
                            ? new Date(s.started_at).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Not started"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer?.full_name ?? "Consumer"}
                        </TableCell>
                        <TableCell>
                          {listener?.full_name ?? "Listener"}
                        </TableCell>
                        <TableCell className="capitalize">{s.mode}</TableCell>
                        <TableCell>
                          {duration(s.started_at, s.ended_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_STYLES[s.status] ?? "outline"}
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/session/${s.id}?origin=booking`}>
                              View
                            </Link>
                          </Button>
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
