-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (team members — extends auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role        text not null check (role in ('admin', 'prayer_team', 'counselor', 'member')),
  bio         text,
  created_at  timestamptz not null default now()
);

-- Auto-create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- POSTS (Q&A discussions)
-- ─────────────────────────────────────────────
create table public.posts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null check (char_length(title) between 3 and 200),
  body            text not null check (char_length(body) between 10 and 5000),
  category        text not null default 'general' check (category in ('general', 'faith', 'prayer', 'life', 'bible', 'other')),
  anonymous_token uuid,
  author_id       uuid references public.profiles(id) on delete set null,
  status          text not null default 'active' check (status in ('active', 'closed', 'removed')),
  reply_count     int not null default 0,
  created_at      timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_status_idx on public.posts (status);

-- ─────────────────────────────────────────────
-- REPLIES
-- ─────────────────────────────────────────────
create table public.replies (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references public.posts(id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 3000),
  anonymous_token uuid,
  author_id       uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index replies_post_id_idx on public.replies (post_id, created_at asc);

-- Keep reply_count in sync
create or replace function public.update_reply_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set reply_count = reply_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set reply_count = greatest(0, reply_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger sync_reply_count
  after insert or delete on public.replies
  for each row execute procedure public.update_reply_count();

-- ─────────────────────────────────────────────
-- PRAYER REQUESTS
-- ─────────────────────────────────────────────
create table public.prayer_requests (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null check (char_length(title) between 3 and 150),
  body             text not null check (char_length(body) between 10 and 3000),
  status           text not null default 'active' check (status in ('active', 'updated', 'answered', 'closed')),
  anonymous_token  uuid,
  contact_email    text,
  is_private       boolean not null default false,
  follow_up_sent_at timestamptz,
  created_at       timestamptz not null default now()
);

create index prayer_requests_status_idx on public.prayer_requests (status, created_at desc);

-- ─────────────────────────────────────────────
-- PRAYER UPDATES (team progress notes)
-- ─────────────────────────────────────────────
create table public.prayer_updates (
  id                 uuid primary key default uuid_generate_v4(),
  prayer_request_id  uuid not null references public.prayer_requests(id) on delete cascade,
  note               text not null check (char_length(note) between 1 and 1000),
  updated_by         uuid not null references public.profiles(id),
  created_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- COUNSELING SESSIONS
-- ─────────────────────────────────────────────
create table public.counseling_sessions (
  id              uuid primary key default uuid_generate_v4(),
  room_id         uuid not null unique default uuid_generate_v4(),
  status          text not null default 'pending' check (status in ('pending', 'active', 'closed')),
  counselor_id    uuid references public.profiles(id) on delete set null,
  anonymous_token uuid not null,
  intake_note     text,
  created_at      timestamptz not null default now(),
  closed_at       timestamptz
);

create index counseling_sessions_status_idx on public.counseling_sessions (status, created_at desc);

-- ─────────────────────────────────────────────
-- MESSAGES (real-time counseling chat)
-- ─────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references public.counseling_sessions(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 2000),
  sender_role text not null check (sender_role in ('user', 'counselor')),
  created_at  timestamptz not null default now()
);

create index messages_session_id_idx on public.messages (session_id, created_at asc);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- Helper: get current user's role
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES
alter table public.profiles enable row level security;
create policy "profiles_select_self" on public.profiles for select using (id = auth.uid());
create policy "profiles_select_admin" on public.profiles for select using (get_my_role() = 'admin');
create policy "profiles_update_self" on public.profiles for update using (id = auth.uid());

-- POSTS
alter table public.posts enable row level security;
create policy "posts_select_active" on public.posts for select using (status = 'active');
create policy "posts_insert_anyone" on public.posts for insert with check (true);
create policy "posts_update_admin" on public.posts for update using (get_my_role() = 'admin');
create policy "posts_delete_admin" on public.posts for delete using (get_my_role() = 'admin');

-- REPLIES
alter table public.replies enable row level security;
create policy "replies_select_all" on public.replies for select using (true);
create policy "replies_insert_anyone" on public.replies for insert with check (true);
create policy "replies_delete_admin" on public.replies for delete using (get_my_role() = 'admin');

-- PRAYER REQUESTS
alter table public.prayer_requests enable row level security;
-- Anyone can submit
create policy "prayer_insert_anyone" on public.prayer_requests for insert with check (true);
-- Public (non-private) requests visible to all
create policy "prayer_select_public" on public.prayer_requests for select
  using (is_private = false and status != 'closed');
-- Submitter can see their own (via token cookie header — enforced app-side, token passed as claim)
create policy "prayer_select_team" on public.prayer_requests for select
  using (get_my_role() in ('prayer_team', 'admin'));
-- Team can update status
create policy "prayer_update_team" on public.prayer_requests for update
  using (get_my_role() in ('prayer_team', 'admin'));

-- PRAYER UPDATES
alter table public.prayer_updates enable row level security;
create policy "prayer_updates_select_all" on public.prayer_updates for select using (true);
create policy "prayer_updates_insert_team" on public.prayer_updates for insert
  with check (get_my_role() in ('prayer_team', 'admin'));

-- COUNSELING SESSIONS
alter table public.counseling_sessions enable row level security;
-- Anyone can create a session
create policy "counseling_insert_anyone" on public.counseling_sessions for insert with check (true);
-- Counselor/admin can see all sessions
create policy "counseling_select_counselor" on public.counseling_sessions for select
  using (get_my_role() in ('counselor', 'admin'));
-- Counselor can update (accept, close)
create policy "counseling_update_counselor" on public.counseling_sessions for update
  using (get_my_role() in ('counselor', 'admin'));
-- Session owner identified by room_id (app enforces via token, not exposed in policy)
-- The room_id is the secret the client holds to access their own room

-- MESSAGES
alter table public.messages enable row level security;
-- Counselors/admins can see all messages
create policy "messages_select_counselor" on public.messages for select
  using (get_my_role() in ('counselor', 'admin'));
-- Anyone can insert (client validates room ownership in API route)
create policy "messages_insert_anyone" on public.messages for insert with check (true);

-- Enable realtime for messages and counseling_sessions
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.counseling_sessions;
