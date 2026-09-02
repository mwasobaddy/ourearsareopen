import { createAdminClient } from "@/lib/supabase/admin";
import { getStartOfMonth } from "@/lib/admin-data";
import { getFeatureFlags } from "@/lib/feature-flags";
import type { Json } from "@/lib/supabase/database.types";

/**
 * Aggregate platform metrics for the Super Admin dashboard, computed from
 * real underlying data (payments, profiles, sessions, queue, support).
 */
export async function getPlatformStats() {
  const admin = createAdminClient();
  const monthStart = getStartOfMonth(new Date()).toISOString();

  const [
    payments,
    usersCount,
    listeners,
    sessions,
    waiting,
    openTickets,
    flags,
  ] = await Promise.all([
    admin
      .from("payments")
      .select("amount_cents, status, created_at"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id, is_active, assigned_listener_id")
      .eq("role", "listener"),
    admin
      .from("sessions")
      .select("id, created_at, status"),
    admin
      .from("queue_entries")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting"),
    admin
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    getFeatureFlags(),
  ]);

  const succeeded = (payments.data ?? []).filter(
    (p) => p.status === "succeeded",
  );
  const totalRevenueCents = succeeded.reduce(
    (sum, p) => sum + (p.amount_cents ?? 0),
    0,
  );
  const monthRevenueCents = succeeded
    .filter((p) => p.created_at >= monthStart)
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
  const monthSessions = (sessions.data ?? []).filter(
    (s) => s.created_at >= monthStart,
  ).length;

  const activeListeners = (listeners.data ?? []).filter(
    (l) => l.is_active,
  ).length;

  const alerts: { level: "warning" | "info"; message: string }[] = [];
  if (!flags.open_queue) alerts.push({ level: "warning", message: "Open chat queue is disabled by feature flag." });
  if (!flags.donations) alerts.push({ level: "info", message: "Donations are disabled by feature flag." });
  if (!flags.free_booking) alerts.push({ level: "info", message: "Free booking is disabled by feature flag." });
  if (waiting.count && waiting.count > 0) {
    alerts.push({ level: "warning", message: `${waiting.count} customer(s) waiting in the chat queue.` });
  }
  if (openTickets.count && openTickets.count > 0) {
    alerts.push({ level: "info", message: `${openTickets.count} open support/refund ticket(s).` });
  }
  if (alerts.length === 0) {
    alerts.push({ level: "info", message: "Platform is operating normally." });
  }

  return {
    totalRevenue: totalRevenueCents / 100,
    monthRevenue: monthRevenueCents / 100,
    totalUsers: usersCount.count ?? 0,
    activeListeners,
    totalListeners: listeners.data?.length ?? 0,
    monthSessions,
    waiting: waiting.count ?? 0,
    openTickets: openTickets.count ?? 0,
    alerts,
    flags,
  };
}

/**
 * Read the single org_config row (or null). Public-read friendly.
 */
export async function getOrgConfig() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("org_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data;
}

/**
 * Append a sensitive action to the audit log. Uses the service-role client so
 * appends succeed regardless of RLS. Best-effort — never throws.
 */
export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      actor_id: input.actorId,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      details: (input.details ?? null) as Json,
    });
  } catch {
    // audit logging is best-effort; never break the primary operation
  }
}

export type EmailTemplateRow = {
  key: string;
  subject: string;
  body: string;
  description: string | null;
};

/**
 * All email templates, ordered by key. Super-admin only (RLS enforced).
 */
export async function getEmailTemplates(): Promise<EmailTemplateRow[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("email_templates")
      .select("key, subject, body, description")
      .order("key", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

