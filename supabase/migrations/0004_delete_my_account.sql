-- ============================================================
-- 0004_delete_my_account.sql
-- Module 2: Allows a user to permanently delete their own account
-- (removes the auth.users row, cascading to profiles).
-- Project: Our Ears Are Open
-- ============================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete the auth user; profiles has on delete cascade.
  delete from auth.users where id = uid;
end;
$$;

-- Only an authenticated user may call this (as themselves).
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
