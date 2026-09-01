-- ============================================================
-- 0013_documents.sql
-- Module 8: Session & Call Management
--   documents table (session notes summaries / exportable files).
-- Project: Our Ears Are Open
-- ============================================================

-- A document attached to a session (e.g. a generated session-notes PDF).
-- type: 'session_notes' | 'consent' | 'other'
create type public.document_type as enum ('session_notes', 'consent', 'other');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  listener_id uuid references public.profiles (id) on delete set null,
  type public.document_type not null default 'session_notes',
  title text not null,
  summary text,
  storage_path text,
  created_at timestamptz not null default now()
);

create index documents_session_idx on public.documents (session_id);
create index documents_user_idx on public.documents (user_id);

alter table public.documents enable row level security;

-- Customer sees documents from their own sessions.
create policy "customer_read_own_documents"
  on public.documents for select
  using (auth.uid() = user_id);

-- The assigned listener sees documents from their sessions.
create policy "listener_read_own_documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and auth.uid() = s.listener_id
    )
  );

-- Admins + super admins manage everything.
create policy "admins_all_documents"
  on public.documents for all
  using (public.is_admin())
  with check (public.is_admin());
