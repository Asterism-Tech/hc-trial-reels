-- ============================================================
-- Migration — 16 Jun 2026
-- Run this in the Supabase SQL editor.
--
-- 1. Secondary platform: trials are run on Instagram only, but a
--    version may later be published elsewhere (TikTok / Facebook).
--    Captured when entering the final results.
-- ============================================================

alter table versions add column if not exists secondary_platform text[] default '{}';
