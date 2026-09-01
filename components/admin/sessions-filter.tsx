"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SessionsFilter({
  query,
  status,
  type,
}: {
  query: string;
  status: string;
  type: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query);
  const [curStatus, setCurStatus] = useState(status);
  const [curType, setCurType] = useState(type);

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (curStatus && curStatus !== "all") params.set("status", curStatus);
    if (curType && curType !== "all") params.set("type", curType);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search consumer..."
        className="max-w-xs"
        onKeyDown={(e) => e.key === "Enter" && apply()}
      />
      <Select value={curStatus} onValueChange={(v) => setCurStatus(v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="ended">Ended</SelectItem>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
      <Select value={curType} onValueChange={(v) => setCurType(v)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="phone">Phone</SelectItem>
          <SelectItem value="chat">Chat</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" onClick={apply} disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Apply
      </Button>
    </div>
  );
}
