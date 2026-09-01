import { createAdminClient } from "@/lib/supabase/admin";

export const HOURS_CAP = 15;

export function getStartOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getStartOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function hoursBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, ms) / 3_600_000;
}

export type ListenerStats = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  hoursThisWeek: number;
  hoursThisMonth: number;
  callsThisWeek: number;
  chatsThisWeek: number;
};

/**
 * Compute weekly/monthly hours + call/chat counts for every listener,
 * derived from real `sessions` rows (status ended/completed with timestamps).
 */
export async function getAllListenerStats(): Promise<ListenerStats[]> {
  const admin = createAdminClient();
  const now = new Date();
  const weekStart = getStartOfWeek(now).toISOString();
  const monthStart = getStartOfMonth(now).toISOString();

  const { data: listeners } = await admin
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .in("role", ["listener"]);

  const { data: sessions } = await admin
    .from("sessions")
    .select("id, mode, status, started_at, ended_at, listener_id");

  const done = (sessions ?? []).filter(
    (s) => s.status === "ended" || s.status === "completed",
  );

  const stats = new Map<
    string,
    {
      hoursThisWeek: number;
      hoursThisMonth: number;
      callsThisWeek: number;
      chatsThisWeek: number;
    }
  >();

  for (const s of done) {
    if (!s.started_at || !s.ended_at) continue;
    const entry = stats.get(s.listener_id) ?? {
      hoursThisWeek: 0,
      hoursThisMonth: 0,
      callsThisWeek: 0,
      chatsThisWeek: 0,
    };
    const h = hoursBetween(s.started_at, s.ended_at);
    if (s.started_at >= weekStart) {
      entry.hoursThisWeek += h;
      if (s.mode === "phone") entry.callsThisWeek += 1;
      else entry.chatsThisWeek += 1;
    }
    if (s.started_at >= monthStart) entry.hoursThisMonth += h;
    stats.set(s.listener_id, entry);
  }

  return (listeners ?? []).map((l) => {
    const e = stats.get(l.id) ?? {
      hoursThisWeek: 0,
      hoursThisMonth: 0,
      callsThisWeek: 0,
      chatsThisWeek: 0,
    };
    return {
      id: l.id,
      full_name: l.full_name,
      email: l.email,
      role: l.role,
      is_active: l.is_active,
      created_at: l.created_at,
      hoursThisWeek: Math.round(e.hoursThisWeek * 100) / 100,
      hoursThisMonth: Math.round(e.hoursThisMonth * 100) / 100,
      callsThisWeek: e.callsThisWeek,
      chatsThisWeek: e.chatsThisWeek,
    };
  });
}
