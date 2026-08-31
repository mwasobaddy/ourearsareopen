"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "customer" | "listener" | "admin" | "super_admin";

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole | null;
};

/**
 * Auth hook backed by Supabase Auth + the `profiles` table.
 * Returns the current session, user, and role, and stays in sync
 * with auth changes (login/logout/refresh).
 */
export function useAuth() {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session?.user) {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        setIsLoading(false);
        return;
      }

      const authUser = session.user;
      let profileRole: UserRole | null = null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profile) {
        profileRole = (profile.role as UserRole) ?? null;
      }

      if (!active) return;

      setIsAuthenticated(true);
      setUser({
        id: authUser.id,
        name: profile?.full_name ?? authUser.user_metadata?.full_name ?? null,
        email: authUser.email ?? null,
        role: profileRole,
      });
      setRole(profileRole);
      setIsLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    isAuthenticated,
    isLoading,
    user,
    role,
  };
}
