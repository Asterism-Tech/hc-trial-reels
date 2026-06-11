-- Hobbycraft Reel Hub — Seed Data
-- Paste into Supabase SQL Editor and click Run
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

-- Trial Group 1: Upcycled Mirror Ball Letter
INSERT INTO trial_groups (id, name, status, test_type, content_theme, upload_date, publish_date, tags, notes)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Upcycled Mirror Ball Letter',
  'won',
  'Voiceover Test',
  array['Ideas/Projects/How to', 'Product'],
  '2025-06-05',
  '2025-06-07',
  array['voiceover', 'audio-hook', '30-60s', '18-24'],
  ''
) ON CONFLICT (id) DO NOTHING;

-- Trial Group 2: Harry Styles - Tie Outfit
INSERT INTO trial_groups (id, name, status, test_type, content_theme, upload_date, publish_date, tags, notes)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002',
  'Harry Styles - Tie Outfit',
  'live',
  'Visual Opening',
  array['Ideas/Projects/How to'],
  '2025-06-05',
  '2025-06-06',
  array['visual-hook', 'influencer-content'],
  ''
) ON CONFLICT (id) DO NOTHING;

-- Mirror Ball Letter — V1 (low performer)
INSERT INTO versions (
  trial_group_id, version_number, total_versions,
  is_winner, is_published, platform, differences,
  hook_type, hook_text, video_length_seconds,
  face_on_camera, has_voiceover, audio_type, text_overlay,
  caption, cta_used, target_age_group,
  views, accounts_reached, likes, comments, shares, saves,
  profile_visits, followers_gained, watch_time_seconds,
  completion_rate_pct, team_comments, thumbnail_url
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001', 1, 3,
  false, false, array['Instagram', 'Facebook'], 'Generic hook — not specific or personable',
  'Audio', 'You should make this disco ball mirror centre piece for your next event', 50,
  true, true, 'Generic/Themed', false,
  '', array['Caption', 'In video'], '18-24',
  219, 208, 8, 0, 1, 0,
  1, 0, 3,
  1.0, 'Hook was not specific or personable enough', ''
) ON CONFLICT DO NOTHING;

-- Mirror Ball Letter — V2 (WINNER)
INSERT INTO versions (
  trial_group_id, version_number, total_versions,
  is_winner, is_published, platform, differences,
  hook_type, hook_text, video_length_seconds,
  face_on_camera, has_voiceover, audio_type, text_overlay,
  caption, cta_used, target_age_group,
  views, accounts_reached, likes, comments, shares, saves,
  profile_visits, followers_gained, watch_time_seconds,
  completion_rate_pct, team_comments, thumbnail_url
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001', 2, 3,
  true, true, array['Instagram', 'Facebook'], 'Personal first-person hook — specific occasion and relatable',
  'Audio', 'I made this disco ball mirror centre piece for my birthday party', 50,
  true, true, 'Generic/Themed', false,
  '', array['Caption', 'In video'], '18-24',
  1536, 1349, 75, 0, 5, 17,
  2, 1, 11,
  6.0, '', ''
) ON CONFLICT DO NOTHING;

-- Mirror Ball Letter — V3
INSERT INTO versions (
  trial_group_id, version_number, total_versions,
  is_winner, is_published, platform, differences,
  hook_type, hook_text, video_length_seconds,
  face_on_camera, has_voiceover, audio_type, text_overlay,
  caption, cta_used, target_age_group,
  views, accounts_reached, likes, comments, shares, saves,
  profile_visits, followers_gained, watch_time_seconds,
  completion_rate_pct, team_comments, thumbnail_url
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001', 3, 3,
  false, false, array['Instagram', 'Facebook'], 'Benefit-focused hook targeting mirror selfie use case',
  'Audio', 'Looking to elevate your mirror selfies then this is the craft for you', 50,
  true, true, 'Generic/Themed', false,
  '', array['Caption', 'In video'], '18-24',
  1414, 1177, 58, 0, 5, 13,
  0, 3, 14,
  10.0, '', ''
) ON CONFLICT DO NOTHING;

-- Harry Styles — V1
INSERT INTO versions (
  trial_group_id, version_number, total_versions,
  is_winner, is_published, platform, differences,
  hook_type, hook_text, video_length_seconds,
  face_on_camera, has_voiceover, audio_type, text_overlay,
  caption, cta_used, target_age_group,
  views, accounts_reached, likes, comments, shares, saves,
  profile_visits, followers_gained, watch_time_seconds,
  completion_rate_pct, team_comments, thumbnail_url
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002', 1, 3,
  false, false, array['Instagram'], 'Version 1 — visual opening variant A',
  'Visual', '', 0, false, false, '', false,
  '', array[]::text[], '',
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', ''
) ON CONFLICT DO NOTHING;

-- Harry Styles — V2
INSERT INTO versions (
  trial_group_id, version_number, total_versions,
  is_winner, is_published, platform, differences,
  hook_type, hook_text, video_length_seconds,
  face_on_camera, has_voiceover, audio_type, text_overlay,
  caption, cta_used, target_age_group,
  views, accounts_reached, likes, comments, shares, saves,
  profile_visits, followers_gained, watch_time_seconds,
  completion_rate_pct, team_comments, thumbnail_url
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002', 2, 3,
  false, false, array['Instagram'], 'Version 2 — visual opening variant B',
  'Visual', '', 0, false, false, '', false,
  '', array[]::text[], '',
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', ''
) ON CONFLICT DO NOTHING;

-- Harry Styles — V3
INSERT INTO versions (
  trial_group_id, version_number, total_versions,
  is_winner, is_published, platform, differences,
  hook_type, hook_text, video_length_seconds,
  face_on_camera, has_voiceover, audio_type, text_overlay,
  caption, cta_used, target_age_group,
  views, accounts_reached, likes, comments, shares, saves,
  profile_visits, followers_gained, watch_time_seconds,
  completion_rate_pct, team_comments, thumbnail_url
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002', 3, 3,
  false, false, array['Instagram'], 'Version 3 — visual opening variant C',
  'Visual', '', 0, false, false, '', false,
  '', array[]::text[], '',
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', ''
) ON CONFLICT DO NOTHING;
