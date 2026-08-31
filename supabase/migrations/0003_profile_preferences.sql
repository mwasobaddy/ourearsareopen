-- ============================================================
-- 0003_profile_preferences.sql
-- Module 2: User Profile & Onboarding — preference columns,
-- assigned-listener FK, and storage RLS for avatars.
-- Project: Our Ears Are Open
-- ============================================================

-- Matching preferences collected in the /profile/setup wizard
-- (step 2 "About You"). Stored as text to keep values flexible.
alter table public.profiles
  add column if not exists country text,
  add column if not exists gender_identity text,
  add column if not exists sexual_orientation text,
  add column if not exists relationship_status text,
  add column if not exists religion_importance text,
  add column if not exists spiritual text,
  add column if not exists prior_therapy text;

-- assigned_listener_id is a self-reference to another profile row
-- (a listener). Added as a proper FK now that the table exists.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_assigned_listener_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_assigned_listener_id_fkey
      foreign key (assigned_listener_id) references public.profiles (id);
  end if;
end $$;

-- Avatar uploads live in the 'avatars' storage bucket.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Authenticated users may read any avatar (they're public images).
create policy "avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- A user may only upload/update/delete their own avatar paths, which
-- are namespaced as <user_id>/<filename>.
create policy "avatar_own_insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_own_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_own_delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
