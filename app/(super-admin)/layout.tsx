"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  ToggleLeft,
  CreditCard,
  Users,
  ScrollText,
  Bell,
} from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const superAdminNavItems = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/config", label: "Config", icon: Settings },
  { href: "/super-admin/features", label: "Feature Flags", icon: ToggleLeft },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/super-admin/users", label: "Users & Roles", icon: Users },
  { href: "/super-admin/audit", label: "Audit Log", icon: ScrollText },
  { href: "/super-admin/notifications", label: "Notifications", icon: Bell },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={superAdminNavItems} portalLabel="Super Admin" />
      <SidebarInset>
        <DashboardHeader
          title="Platform Administration"
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
