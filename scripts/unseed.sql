-- Remove all seed data from Roundtable.
-- Run this in Supabase Dashboard → SQL Editor if you prefer not to use `npm run unseed`.

-- Reactions (polymorphic — no FK cascade)
DELETE FROM public.reactions
WHERE target_id IN (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02'
);

DELETE FROM public.moment_reactions
WHERE moment_id IN (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02'
);

-- Cascading deletes handle replies, messages, prayer_updates
DELETE FROM public.replies
WHERE post_id IN (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02'
);

DELETE FROM public.messages
WHERE session_id IN (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc02'
);

DELETE FROM public.honest_hours
WHERE id IN (
  'ffffffff-ffff-4fff-8fff-ffffffffff01',
  'ffffffff-ffff-4fff-8fff-ffffffffff02'
);

DELETE FROM public.god_moments
WHERE id IN (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02'
);

DELETE FROM public.daily_drops
WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd01'
   OR drop_date = '2099-01-01';

DELETE FROM public.counseling_sessions
WHERE id IN (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc02'
);

DELETE FROM public.prayer_requests
WHERE id IN (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02'
);

DELETE FROM public.posts
WHERE id IN (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02'
);

-- Catch any stragglers tagged [SEED]
DELETE FROM public.posts WHERE title LIKE '[SEED]%';
DELETE FROM public.prayer_requests WHERE title LIKE '[SEED]%';
