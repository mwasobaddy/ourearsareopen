"use client";

import {
  Headphones,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MessageSquare,
  Phone,
  FileText,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Headphones,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MessageSquare,
  Phone,
  FileText,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  /** Icon name: Headphones, Calendar, Users, DollarSign, Clock, MessageSquare, Phone, FileText, LayoutDashboard */
  icon?: keyof typeof ICON_MAP;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: iconName,
  trend,
  className,
}: StatsCardProps) {
  const Icon = iconName ? ICON_MAP[iconName] : null;
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.value > 0 ? "+" : ""}
            {trend.value} {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
