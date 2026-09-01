-- ============================================================
-- 0011_realtime_sessions.sql
-- Module 6: Realtime — Voice & Chat (chat portion)
--   sessions + messages tables, RLS, realtime publication.
-- Project: Our Ears Are Open
-- ============================================================

-- Session mode: chat is fully supported now; phone uses Twilio/LiveKit (Module 6 voice TO-DO, client-blocked).
create type public.session_mode as enum ('chat', 'phone');

-- Session lifecycle:
--   pending  -> created, not yet started
--   active   -> participants joined / call connected
--   left     -> one participant disconnected (listener/customer left)
--   ended    -> session over
--   completed-> finished + notes/debrief recorded
create type public.session_status as enum (
  'pending', 'active', 'left', 'ended', 'completed'
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  mode public.session_mode not null default 'chat',
  status public.session_status not null default 'pending',
  user_id uuid not null references public.profiles (id) on delete cascade,
  listener_id uuid not null references public.profiles (id) on delete cascade,
  queue_entry_id uuid references public.queue_entries (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  room_id text, -- reserved for Twilio/LiveKit room token (voice)
  notes text,   -- listener debrief notes
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- a session must come from either a queue entry or a scheduled booking
  constraint sessions_origin_check check (
    (queue_entry_id is not null) or (booking_id is not null)
  )
);

create index sessions_user_idx on public.sessions (user_id, status);
create index sessions_listener_idx on public.sessions (listener_id, status);
create index sessions_queue_idx on public.sessions (queue_entry_id);

create trigger set_sessions_updated_at
  before update on public.sessions
  for each row execute procedure public.handle_updated_at();

alter table public.sessions enable row level security;

-- Participants (customer or assigned listener) can read the session.
create policy "participant_read_session"
  on public.sessions for select
  using (auth.uid() = user_id or auth.uid() = listener_id);

-- Participants can update the session (status transitions, notes).
create policy "participant_update_session"
  on public.sessions for update
  using (auth.uid() = user_id or auth.uid() = listener_id);

-- Admins + super admins manage everything.
create policy "admins_all_sessions"
  on public.sessions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Enable Realtime so both participants get live status notifications.
alter publication supabase_realtime add table public.sessions;

-- ------------------------------------------------------------
-- messages: realtime chat within a session.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_session_idx on public.messages (session_id, created_at);

alter table public.messages enable row level security;

-- Only a participant of the session can read its messages.
create policy "participant_read_messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and (auth.uid() = s.user_id or auth.uid() = s.listener_id)
    )
  );

-- A participant can send a message (sender must be a participant).
create policy "participant_insert_messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and (auth.uid() = s.user_id or auth.uid() = s.listener_id)
        and auth.uid() = sender_id
    )
  );

-- Enable Realtime so messages stream in live.
alter publication supabase_realtime add table public.messages;
