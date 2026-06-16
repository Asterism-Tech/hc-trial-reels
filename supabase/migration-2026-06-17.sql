-- ============================================================
-- Migration — 17 Jun 2026
-- Run this in the Supabase SQL editor.
--
-- 1. Snapshots: each version now stores stats at three fixed time
--    points (24h, 3d, 7d) as a JSONB array. Existing flat stat
--    columns are kept for analytics query compatibility; new data
--    is written to the snapshots column.
-- 2. Secondary platform date + notes: Liv can now record when a
--    version was cross-posted and add brief notes.
-- ============================================================

alter table versions
  add column if not exists snapshots jsonb default '[]'::jsonb;

alter table versions
  add column if not exists secondary_platform_date date;

alter table versions
  add column if not exists secondary_platform_notes text default '';
