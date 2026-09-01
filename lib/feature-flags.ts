import { createAdminClient } from "@/lib/supabase/admin";

export type FeatureFlagKey =
  | "open_queue"
  | "donations"
  | "free_booking"
  | "scheduled_phone";

const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  open_queue: true,
  donations: true,
  free_booking: true,
  scheduled_phone: true,
};

/**
 * Read all platform feature flags via the admin (service-role) client so they
 * are available regardless of RLS and free to read for gating server logic.
 * Falls back to the compiled-in defaults if the flags table is empty/unreachable.
 */
export async function getFeatureFlags(): Promise<Record<FeatureFlagKey, boolean>> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("feature_flags")
    .select("key, enabled");

  const flags = { ...DEFAULT_FLAGS };
  for (const row of data ?? []) {
    if (row.key in flags) {
      flags[row.key as FeatureFlagKey] = row.enabled;
    }
  }
  return flags;
}

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key];
}
