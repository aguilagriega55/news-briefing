-- Widen the editions check constraint to accept all four daily editions.
-- The cron runs 4x/day (vercel.json) emitting morning/midday/evening/midnight,
-- but 001 only permitted morning/evening, so midday/midnight inserts failed.
-- Postgres names the inline column check from 001 `briefings_edition_check`.

alter table briefings
  drop constraint if exists briefings_edition_check;

alter table briefings
  add constraint briefings_edition_check
  check (edition in ('morning', 'midday', 'evening', 'midnight'));
