-- Counseling routing, SLA timestamps, volunteer availability

alter table public.profiles
  add column if not exists available_for_counseling boolean not null default false;

alter table public.counseling_sessions
  add column if not exists first_response_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists risk_flag text not null default 'none'
    check (risk_flag in ('none', 'self_harm', 'harm_to_others'));

-- Allow system messages (crisis resources, automated notices)
alter table public.messages drop constraint if exists messages_sender_role_check;
alter table public.messages
  add constraint messages_sender_role_check
  check (sender_role in ('user', 'counselor', 'system'));
