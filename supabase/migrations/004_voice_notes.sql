-- Voice note attachments on counseling messages + storage bucket

alter table public.messages
  add column if not exists audio_url text,
  add column if not exists audio_duration_seconds int
    check (audio_duration_seconds is null or (audio_duration_seconds >= 1 and audio_duration_seconds <= 90));

insert into storage.buckets (id, name, public)
values ('counsel-audio', 'counsel-audio', false)
on conflict (id) do nothing;
