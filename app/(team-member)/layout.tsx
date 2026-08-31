"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Clock,
  FileText,
  User,
  Settings,
} from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const teamMemberNavItems = [
  { href: "/team-member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/team-member/appointments", label: "Appointments", icon: Calendar },
  { href: "/team-member/queue", label: "Chat Queue", icon: MessageSquare },
  { href: "/team-member/availability", label: "Availability", icon: Clock },
  { href: "/team-member/sessions", label: "Session History", icon: FileText },
  { href: "/team-member/profile", label: "Profile", icon: User },
  { href: "/team-member/settings", label: "Settings", icon: Settings },
];

export default function TeamMemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={teamMemberNavItems} portalLabel="Team Member" />
      <SidebarInset>
        <DashboardHeader
          title="Team Member Portal"
          userMenu={
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Log out
            </Link>
          }
        />
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
