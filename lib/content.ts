import { createAdminClient } from "@/lib/supabase/admin";

export type ContentRoom = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type CrisisLink = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  availability: string | null;
  is_primary: boolean;
  is_active: boolean;
  sort_order: number;
};

/**
 * All community rooms (active + inactive), ordered by sort_order.
 * Used by the admin content editor.
 */
export async function getContentRooms(): Promise<ContentRoom[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("content_rooms")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as ContentRoom[];
}

/**
 * Active community rooms only — for public display.
 */
export async function getActiveContentRooms(): Promise<ContentRoom[]> {
  const rooms = await getContentRooms();
  return rooms.filter((r) => r.is_active);
}

/**
 * All crisis resources (active + inactive), ordered by sort_order.
 * Used by the admin content editor.
 */
export async function getContentCrisis(): Promise<CrisisLink[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("content_crisis")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as CrisisLink[];
}

/**
 * Active crisis resources only — for public display.
 */
export async function getActiveContentCrisis(): Promise<CrisisLink[]> {
  const links = await getContentCrisis();
  return links.filter((l) => l.is_active);
}
