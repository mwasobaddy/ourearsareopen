"use client";

export type UserRole = "customer" | "listener" | "admin" | "super_admin";

/**
 * Auth hook for connect/session flows.
 * Replace this implementation when adding Clerk, NextAuth, Supabase, etc.
 * For now returns false — users must sign up before connecting with listeners.
 */
export function useAuth() {
  // TODO: Integrate with your auth provider (Clerk, NextAuth, Supabase, etc.)
  // Example: const { isSignedIn, user } = useClerk();
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null as { name?: string; email?: string } | null,
    role: null as UserRole | null,
  };
}
