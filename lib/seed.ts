import { SupabaseClient } from '@supabase/supabase-js'

export async function seedDatabase(supabase: SupabaseClient) {
  const { data: existing } = await supabase.from('trial_groups').select('id').limit(1)
  if (existing && existing.length > 0) {
    return { message: 'Database already seeded', skipped: true }
  }

  // Trial Group 1: Upcycled Mirror Ball Letter — complete trial with all 3 snapshot points
  const { data: tg1, error: tg1Error } = await supabase
    .from('trial_groups')
    .insert({
      name: 'Upcycled Mirror Ball Letter',
      status: 'won',
      test_type: 'Voiceover Test',
      content_theme: ['Ideas/Projects/How to', 'Product'],
      upload_date: '2025-06-05',
      publish_date: '2025-06-07',
      tags: ['Voiceover Test', 'Audio Hook', '45-55s', '18-24'],
      notes: '',
    })
    .select()
    .single()

  if (tg1Error) throw tg1Error

  await supabase.from('versions').insert([
    {
      trial_group_id: tg1.id,
      version_number: 1,
      total_versions: 3,
      is_winner: false,
      is_published: false,
      platform: ['Instagram'],
      differences: 'Generic hook — not specific or personable',
      hook_type: 'Audio Hook',
      hook_text: 'You should make this disco ball mirror centre piece for your next event',
      video_length_seconds: 50,
      face_on_camera: true,
      has_voiceover: true,
      audio_type: 'Generic / Themed',
      text_overlay: false,
      caption: '',
      cta_used: ['Caption', 'In video'],
      target_age_group: '18-24',
      // Flat columns kept for analytics query compatibility
      views: 219,
      accounts_reached: 208,
      likes: 8,
      comments: 0,
      shares: 1,
      saves: 0,
      profile_visits: 1,
      followers_gained: 0,
      watch_time_seconds: 3,
      completion_rate_pct: 1.0,
      team_comments: 'Hook was not specific or personable enough',
      thumbnail_url: '',
      snapshots: [
        {
          takenAt: '24h', capturedDate: '2025-06-08',
          views: 219, accountsReached: 208, likes: 8, comments: 0,
          shares: 1, saves: 0, profileVisits: 1, followersGained: 0,
          watchTimeSeconds: 3, completionRatePct: 1.0, successScore: null,
        },
        {
          takenAt: '3d', capturedDate: '2025-06-10',
          views: 261, accountsReached: 244, likes: 9, comments: 0,
          shares: 1, saves: 0, profileVisits: 1, followersGained: 0,
          watchTimeSeconds: 3, completionRatePct: 1.0, successScore: null,
        },
        {
          takenAt: '7d', capturedDate: '2025-06-14',
          views: 298, accountsReached: 278, likes: 10, comments: 0,
          shares: 1, saves: 0, profileVisits: 2, followersGained: 0,
          watchTimeSeconds: 3, completionRatePct: 1.1, successScore: null,
        },
      ],
    },
    {
      trial_group_id: tg1.id,
      version_number: 2,
      total_versions: 3,
      is_winner: true,
      is_published: true,
      platform: ['Instagram'],
      differences: 'Personal first-person hook — specific occasion and relatable',
      hook_type: 'Audio Hook',
      hook_text: 'I made this disco ball mirror centre piece for my birthday party',
      video_length_seconds: 50,
      face_on_camera: true,
      has_voiceover: true,
      audio_type: 'Generic / Themed',
      text_overlay: false,
      caption: '',
      cta_used: ['Caption', 'In video'],
      target_age_group: '18-24',
      views: 1536,
      accounts_reached: 1349,
      likes: 75,
      comments: 0,
      shares: 5,
      saves: 17,
      profile_visits: 2,
      followers_gained: 1,
      watch_time_seconds: 11,
      completion_rate_pct: 6.0,
      team_comments: '',
      thumbnail_url: '',
      snapshots: [
        {
          takenAt: '24h', capturedDate: '2025-06-08',
          views: 1536, accountsReached: 1349, likes: 75, comments: 0,
          shares: 5, saves: 17, profileVisits: 2, followersGained: 1,
          watchTimeSeconds: 11, completionRatePct: 6.0, successScore: null,
        },
        {
          takenAt: '3d', capturedDate: '2025-06-10',
          views: 2148, accountsReached: 1890, likes: 102, comments: 2,
          shares: 8, saves: 23, profileVisits: 4, followersGained: 2,
          watchTimeSeconds: 11, completionRatePct: 7.2, successScore: null,
        },
        {
          takenAt: '7d', capturedDate: '2025-06-14',
          views: 2891, accountsReached: 2540, likes: 134, comments: 3,
          shares: 11, saves: 30, profileVisits: 6, followersGained: 3,
          watchTimeSeconds: 11, completionRatePct: 7.8, successScore: null,
        },
      ],
    },
    {
      trial_group_id: tg1.id,
      version_number: 3,
      total_versions: 3,
      is_winner: false,
      is_published: false,
      platform: ['Instagram'],
      secondary_platform: ['TikTok'],
      differences: 'Benefit-focused hook targeting mirror selfie use case',
      hook_type: 'Audio Hook',
      hook_text: 'Looking to elevate your mirror selfies then this is the craft for you',
      video_length_seconds: 50,
      face_on_camera: true,
      has_voiceover: true,
      audio_type: 'Generic / Themed',
      text_overlay: false,
      caption: '',
      cta_used: ['Caption', 'In video'],
      target_age_group: '18-24',
      views: 1414,
      accounts_reached: 1177,
      likes: 58,
      comments: 0,
      shares: 5,
      saves: 13,
      profile_visits: 0,
      followers_gained: 3,
      watch_time_seconds: 14,
      completion_rate_pct: 10.0,
      team_comments: '',
      thumbnail_url: '',
      snapshots: [
        {
          takenAt: '24h', capturedDate: '2025-06-08',
          views: 1414, accountsReached: 1177, likes: 58, comments: 0,
          shares: 5, saves: 13, profileVisits: 0, followersGained: 3,
          watchTimeSeconds: 14, completionRatePct: 10.0, successScore: null,
        },
        {
          takenAt: '3d', capturedDate: '2025-06-10',
          views: 1820, accountsReached: 1512, likes: 74, comments: 1,
          shares: 7, saves: 17, profileVisits: 2, followersGained: 4,
          watchTimeSeconds: 14, completionRatePct: 10.4, successScore: null,
        },
        {
          takenAt: '7d', capturedDate: '2025-06-14',
          views: 2210, accountsReached: 1834, likes: 88, comments: 1,
          shares: 9, saves: 20, profileVisits: 3, followersGained: 5,
          watchTimeSeconds: 14, completionRatePct: 10.7, successScore: null,
        },
      ],
    },
  ])

  // Trial Group 2: Harry Styles - Tie Outfit — live, awaiting 24h data
  const { data: tg2, error: tg2Error } = await supabase
    .from('trial_groups')
    .insert({
      name: 'Harry Styles - Tie Outfit',
      status: 'live',
      test_type: 'Visual Opening',
      content_theme: ['Ideas/Projects/How to'],
      upload_date: '2025-06-05',
      publish_date: '2025-06-06',
      tags: ['Visual Hook', 'Ideas/Projects/How to'],
      notes: '',
    })
    .select()
    .single()

  if (tg2Error) throw tg2Error

  await supabase.from('versions').insert([
    {
      trial_group_id: tg2.id,
      version_number: 1,
      total_versions: 3,
      is_winner: false,
      is_published: false,
      platform: ['Instagram'],
      differences: 'Version 1 — visual opening variant A',
      hook_type: 'Visual Hook',
      hook_text: '',
      video_length_seconds: 0,
      face_on_camera: false,
      has_voiceover: false,
      audio_type: '',
      text_overlay: false,
      caption: '',
      cta_used: [],
      target_age_group: '',
      views: 0, accounts_reached: 0, likes: 0, comments: 0, shares: 0,
      saves: 0, profile_visits: 0, followers_gained: 0,
      watch_time_seconds: 0, completion_rate_pct: 0,
      team_comments: '', thumbnail_url: '',
      snapshots: [],
    },
    {
      trial_group_id: tg2.id,
      version_number: 2,
      total_versions: 3,
      is_winner: false,
      is_published: false,
      platform: ['Instagram'],
      differences: 'Version 2 — visual opening variant B',
      hook_type: 'Visual Hook',
      hook_text: '',
      video_length_seconds: 0,
      face_on_camera: false,
      has_voiceover: false,
      audio_type: '',
      text_overlay: false,
      caption: '',
      cta_used: [],
      target_age_group: '',
      views: 0, accounts_reached: 0, likes: 0, comments: 0, shares: 0,
      saves: 0, profile_visits: 0, followers_gained: 0,
      watch_time_seconds: 0, completion_rate_pct: 0,
      team_comments: '', thumbnail_url: '',
      snapshots: [],
    },
    {
      trial_group_id: tg2.id,
      version_number: 3,
      total_versions: 3,
      is_winner: false,
      is_published: false,
      platform: ['Instagram'],
      differences: 'Version 3 — visual opening variant C',
      hook_type: 'Visual Hook',
      hook_text: '',
      video_length_seconds: 0,
      face_on_camera: false,
      has_voiceover: false,
      audio_type: '',
      text_overlay: false,
      caption: '',
      cta_used: [],
      target_age_group: '',
      views: 0, accounts_reached: 0, likes: 0, comments: 0, shares: 0,
      saves: 0, profile_visits: 0, followers_gained: 0,
      watch_time_seconds: 0, completion_rate_pct: 0,
      team_comments: '', thumbnail_url: '',
      snapshots: [],
    },
  ])

  return { message: 'Database seeded successfully', skipped: false }
}
