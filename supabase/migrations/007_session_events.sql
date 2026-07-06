-- Session audit log for counselor tooling

create table if not exists public.session_events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.counseling_sessions(id) on delete cascade,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null check (action in ('accepted', 'message_sent', 'escalated', 'closed')),
  created_at  timestamptz not null default now()
);

create index if not exists session_events_session_idx on public.session_events(session_id, created_at asc);

alter table public.session_events enable row level security;
create policy "session_events_select_team" on public.session_events for select
  using (public.get_my_role() in ('counselor', 'admin'));
create policy "session_events_insert_team" on public.session_events for insert
  with check (public.get_my_role() in ('counselor', 'admin'));
