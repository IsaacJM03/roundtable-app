-- Phase 2: Daily Drop, God Moments, Reactions, Honest Hours

-- ─────────────────────────────────────────────
-- DAILY DROPS
-- ─────────────────────────────────────────────
create table public.daily_drops (
  id         uuid primary key default uuid_generate_v4(),
  drop_date  date unique not null,
  verse_ref  text not null,
  verse_text text not null,
  reflection text not null check (char_length(reflection) <= 600),
  question   text not null check (char_length(question) <= 200),
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index daily_drops_date_idx on public.daily_drops(drop_date desc);

ALTER TABLE public.daily_drops ENABLE ROW LEVEL SECURITY;

create policy "drops_select_all" on public.daily_drops
  for select using (true);

create policy "drops_insert_team" on public.daily_drops
  for insert with check (public.get_my_role() in ('prayer_team', 'admin'));

create policy "drops_update_team" on public.daily_drops
  for update using (public.get_my_role() in ('prayer_team', 'admin'));

-- ─────────────────────────────────────────────
-- GOD MOMENTS (short anonymous testimonies)
-- ─────────────────────────────────────────────
create table public.god_moments (
  id              uuid primary key default uuid_generate_v4(),
  body            text not null check (char_length(body) between 20 and 500),
  anonymous_token uuid,
  status          text not null default 'active' check (status in ('active', 'removed')),
  created_at      timestamptz not null default now()
);

create index god_moments_created_idx on public.god_moments(created_at desc);

alter table public.god_moments enable row level security;

create policy "moments_select_active" on public.god_moments
  for select using (status = 'active');

create policy "moments_insert_anyone" on public.god_moments
  for insert with check (true);

create policy "moments_update_team" on public.god_moments
  for update using (public.get_my_role() in ('prayer_team', 'admin'));

-- moment reactions
create table public.moment_reactions (
  id            uuid primary key default uuid_generate_v4(),
  moment_id     uuid not null references public.god_moments(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('praying', 'amen', 'felt_this')),
  anon_token    uuid not null,
  created_at    timestamptz not null default now(),
  unique (moment_id, anon_token, reaction_type)
);

create index moment_reactions_moment_idx on public.moment_reactions(moment_id);

alter table public.moment_reactions enable row level security;

create policy "moment_reactions_select" on public.moment_reactions
  for select using (true);

create policy "moment_reactions_insert" on public.moment_reactions
  for insert with check (true);

create policy "moment_reactions_delete" on public.moment_reactions
  for delete using (true);

-- ─────────────────────────────────────────────
-- REACTIONS (polymorphic — posts + prayers)
-- ─────────────────────────────────────────────
create table public.reactions (
  id            uuid primary key default uuid_generate_v4(),
  target_type   text not null check (target_type in ('post', 'prayer')),
  target_id     uuid not null,
  reaction_type text not null check (reaction_type in ('praying', 'amen', 'felt_this')),
  anon_token    uuid not null,
  created_at    timestamptz not null default now(),
  unique (target_type, target_id, anon_token, reaction_type)
);

create index reactions_target_idx on public.reactions(target_type, target_id);

alter table public.reactions enable row level security;

create policy "reactions_select" on public.reactions
  for select using (true);

create policy "reactions_insert" on public.reactions
  for insert with check (true);

create policy "reactions_delete" on public.reactions
  for delete using (true);

-- ─────────────────────────────────────────────
-- HONEST HOURS (24h ephemeral anonymous vents)
-- ─────────────────────────────────────────────
create table public.honest_hours (
  id              uuid primary key default uuid_generate_v4(),
  body            text not null check (char_length(body) between 10 and 400),
  anonymous_token uuid not null,
  expires_at      timestamptz not null default (now() + interval '24 hours'),
  reaction_count  int not null default 0,
  team_note       text,
  team_note_by    uuid references public.profiles(id) on delete set null,
  status          text not null default 'active' check (status in ('active', 'removed')),
  created_at      timestamptz not null default now()
);

create index honest_hours_expires_idx on public.honest_hours(expires_at desc);

alter table public.honest_hours enable row level security;

-- Public: only see non-expired, active posts
create policy "honest_select_active" on public.honest_hours
  for select using (status = 'active' and expires_at > now());

-- Team: see everything including expired
create policy "honest_select_team" on public.honest_hours
  for select using (public.get_my_role() in ('prayer_team', 'admin', 'counselor'));

create policy "honest_insert_anyone" on public.honest_hours
  for insert with check (true);

create policy "honest_update_team" on public.honest_hours
  for update using (public.get_my_role() in ('prayer_team', 'admin'));

-- Reaction count increment (any authenticated or anon — done via rpc or direct update)
create policy "honest_update_reaction" on public.honest_hours
  for update using (true) with check (true);
