"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  UserCircle,
  FileText,
  BarChart3,
  Headphones,
  HelpCircle,
} from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/listeners", label: "Listeners", icon: Headphones },
  { href: "/admin/sessions", label: "Sessions", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: UserCircle },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/support", label: "Support", icon: HelpCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={adminNavItems} portalLabel="Admin" />
      <SidebarInset>
        <DashboardHeader
          title="Administration"
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
