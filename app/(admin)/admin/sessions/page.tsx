import type { Metadata } from "next";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Sessions | Admin | Our Ears Are Open",
  description: "Monitor all chat and phone sessions.",
};

const mockSessions = [
  { id: "1", consumer: "Jane Doe", listener: "Jordan Lee", type: "Phone", date: "2026-03-07", time: "2:00 PM", status: "completed", duration: "14 min" },
  { id: "2", consumer: "John Smith", listener: "Alex Smith", type: "Chat", date: "2026-03-07", time: "1:30 PM", status: "completed", duration: "12 min" },
  { id: "3", consumer: "Sam Brown", listener: "Jordan Lee", type: "Chat", date: "2026-03-07", time: "3:00 PM", status: "in_progress", duration: "—" },
  { id: "4", consumer: "Alex Johnson", listener: "Morgan Davis", type: "Phone", date: "2026-03-06", time: "11:00 AM", status: "completed", duration: "15 min" },
];

export default function AdminSessionsPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          Monitor all live and historical chat and phone sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All sessions</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search..." className="max-w-xs" />
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {mockSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {session.date} {session.time}
                  </TableCell>
                  <TableCell className="font-medium">{session.consumer}</TableCell>
                  <TableCell>{session.listener}</TableCell>
                  <TableCell>{session.type}</TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === "completed"
                          ? "secondary"
                          : session.status === "in_progress"
                            ? "default"
                            : "outline"
                      }
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/session/${session.id}`}>View</Link>
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
