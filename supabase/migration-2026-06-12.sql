-- ============================================================
-- Migration — 12 Jun 2026
-- Run this in the Supabase SQL editor.
--
-- 1. Per-version tags: stage-1 tags on a trial group are now
--    "global tags" shared by every version; each version gets
--    its own tags for comparing versions against each other.
-- 2. Campaign data reminders: groups can dismiss the
--    "fill in campaign data" prompt that appears 3 days after
--    the winner is published.
-- ============================================================

alter table versions add column if not exists tags text[] default '{}';

alter table trial_groups add column if not exists data_reminder_dismissed boolean default false;
