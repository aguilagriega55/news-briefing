create table if not exists briefings (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  edition text not null check (edition in ('morning', 'evening')),
  articles jsonb not null,
  fetched_at timestamptz not null default now(),
  date date not null default current_date
);

create index if not exists briefings_lookup
  on briefings (section_id, edition, date);
