-- Prayer testimonies from original poster

alter table public.prayer_requests
  add column if not exists testimony text
    check (testimony is null or char_length(testimony) between 20 and 2000),
  add column if not exists testimony_at timestamptz;
