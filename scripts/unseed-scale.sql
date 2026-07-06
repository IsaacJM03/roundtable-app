-- Remove scale-test prayer wall + testimony wall data (scripts/seed-scale.ts)
-- Run in Supabase SQL Editor if you prefer SQL over: npm run unseed:scale

delete from public.reactions
where target_id in (
  select id from public.prayer_requests where title like '[SCALE]%'
);

delete from public.prayer_updates
where prayer_request_id in (
  select id from public.prayer_requests where title like '[SCALE]%'
);

delete from public.moment_reactions
where moment_id in (
  select id from public.god_moments where body like '[SCALE]%'
);

delete from public.prayer_requests where title like '[SCALE]%';
delete from public.god_moments where body like '[SCALE]%';

-- Or by fixed UUID prefix:
-- delete from public.prayer_requests where id::text like '10000000-0000-4000-8000-%';
-- delete from public.god_moments where id::text like '20000000-0000-4000-8000-%';
