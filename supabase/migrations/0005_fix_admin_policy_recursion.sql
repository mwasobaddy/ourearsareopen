-- ============================================================
-- 0005_fix_admin_policy_recursion.sql
-- Module 2: Fix infinite-recursion in admins_read_all_profiles by
-- using a SECURITY DEFINER is_admin() helper (bypasses RLS).
-- Project: Our Ears Are Open
-- ============================================================

-- Drop the recursive policy (it selected from profiles within a
-- profiles policy, causing infinite recursion).
drop policy if exists "admins_read_all_profiles" on public.profiles;

-- SECURITY DEFINER helper: runs with the owner's privileges so it is
-- exempt from RLS, preventing recursion when referenced from a policy.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Recreate the admin policy using the non-recursive helper.
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (public.is_admin());
