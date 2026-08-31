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
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Audit Log | Super Admin | Our Ears Are Open",
  description: "Platform audit trail.",
};

const mockAuditLog = [
  { id: "1", actor: "super@ourearsareopen.com", action: "config.updated", resource: "org_config", timestamp: "2026-03-07 10:30:00" },
  { id: "2", actor: "admin@ourearsareopen.com", action: "user.role_changed", resource: "users/2", timestamp: "2026-03-07 09:15:00" },
  { id: "3", actor: "super@ourearsareopen.com", action: "features.updated", resource: "feature_flags", timestamp: "2026-03-06 14:22:00" },
];

export default function SuperAdminAuditPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Sensitive actions and platform changes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLog.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground text-sm">{entry.timestamp}</TableCell>
                  <TableCell>{entry.actor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.action}</Badge>
                  </TableCell>
                  <TableCell>{entry.resource}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
