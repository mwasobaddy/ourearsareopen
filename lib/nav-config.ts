import type { SidebarNavItem } from "@/components/dashboard/app-sidebar";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Clock,
  User,
  Settings,
  BarChart3,
  FileText,
  Cog,
  Flag,
  CreditCard,
  Shield,
  Bell,
} from "lucide-react";

export const TEAM_MEMBER_NAV: SidebarNavItem[] = [
  { href: "/team-member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/team-member/appointments", label: "Appointments", icon: Calendar },
  { href: "/team-member/queue", label: "Chat Queue", icon: MessageSquare },
  { href: "/team-member/availability", label: "Availability", icon: Clock },
  { href: "/team-member/sessions", label: "Session History", icon: FileText },
  { href: "/team-member/profile", label: "Profile", icon: User },
];

export const ADMIN_NAV: SidebarNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/listeners", label: "Listeners", icon: Users },
  { href: "/admin/sessions", label: "Sessions", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export const SUPER_ADMIN_NAV: SidebarNavItem[] = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/config", label: "Config", icon: Cog },
  { href: "/super-admin/features", label: "Features", icon: Flag },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/super-admin/users", label: "Users & Roles", icon: Shield },
  { href: "/super-admin/audit", label: "Audit Log", icon: FileText },
  { href: "/super-admin/notifications", label: "Notifications", icon: Bell },
];
