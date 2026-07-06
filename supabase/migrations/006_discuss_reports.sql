-- Discuss reports and off-topic category

create table if not exists public.post_reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  reporter_token uuid not null,
  reason      text not null check (char_length(reason) between 3 and 500),
  status      text not null default 'pending'
    check (status in ('pending', 'reviewed', 'actioned')),
  created_at  timestamptz not null default now()
);

create index if not exists post_reports_status_idx on public.post_reports(status, created_at desc);

alter table public.post_reports enable row level security;
create policy "reports_insert_anyone" on public.post_reports for insert with check (true);
create policy "reports_select_admin" on public.post_reports for select
  using (public.get_my_role() = 'admin');
create policy "reports_update_admin" on public.post_reports for update
  using (public.get_my_role() = 'admin');

-- Add off_topic category
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts
  add constraint posts_category_check
  check (category in ('general', 'faith', 'prayer', 'life', 'bible', 'other', 'off_topic'));
