import { SupabaseClient } from '@supabase/supabase-js'
import { TrialGroup, Version } from './types'

function mapVersion(row: Record<string, unknown>): Version {
  return {
    id: row.id as string,
    trialGroupId: row.trial_group_id as string,
    versionNumber: row.version_number as number,
    totalVersions: row.total_versions as number,
    isWinner: row.is_winner as boolean,
    isPublished: row.is_published as boolean,
    platform: (row.platform as string[]) || [],
    differences: (row.differences as string) || '',
    hookType: (row.hook_type as string) || '',
    hookText: (row.hook_text as string) || '',
    videoLengthSeconds: (row.video_length_seconds as number) || 0,
    faceOnCamera: (row.face_on_camera as boolean) || false,
    hasVoiceover: (row.has_voiceover as boolean) || false,
    audioType: (row.audio_type as string) || '',
    textOverlay: (row.text_overlay as boolean) || false,
    caption: (row.caption as string) || '',
    ctaUsed: (row.cta_used as string[]) || [],
    targetAgeGroup: (row.target_age_group as string) || '',
    tags: (row.tags as string[]) || [],
    views: (row.views as number) || 0,
    accountsReached: (row.accounts_reached as number) || 0,
    likes: (row.likes as number) || 0,
    comments: (row.comments as number) || 0,
    shares: (row.shares as number) || 0,
    saves: (row.saves as number) || 0,
    profileVisits: (row.profile_visits as number) || 0,
    followersGained: (row.followers_gained as number) || 0,
    watchTimeSeconds: (row.watch_time_seconds as number) || 0,
    completionRatePct: (row.completion_rate_pct as number) || 0,
    teamComments: (row.team_comments as string) || '',
    thumbnailUrl: (row.thumbnail_url as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapGroup(row: Record<string, unknown>, versions: Version[]): TrialGroup {
  return {
    id: row.id as string,
    name: row.name as string,
    status: row.status as TrialGroup['status'],
    testType: (row.test_type as string) || '',
    contentTheme: (row.content_theme as string[]) || [],
    uploadDate: (row.upload_date as string) || '',
    publishDate: (row.publish_date as string) || '',
    tags: (row.tags as string[]) || [],
    notes: (row.notes as string) || '',
    dataReminderDismissed: (row.data_reminder_dismissed as boolean) || false,
    versions,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function fetchTrialGroups(supabase: SupabaseClient): Promise<TrialGroup[]> {
  const { data: groups, error: gErr } = await supabase
    .from('trial_groups')
    .select('*')
    .order('updated_at', { ascending: false })

  if (gErr || !groups) return []

  const groupIds = groups.map((g: Record<string, unknown>) => g.id)
  if (groupIds.length === 0) return []

  const { data: versions, error: vErr } = await supabase
    .from('versions')
    .select('*')
    .in('trial_group_id', groupIds)
    .order('version_number', { ascending: true })

  if (vErr || !versions) return groups.map((g: Record<string, unknown>) => mapGroup(g, []))

  const versionsByGroup = versions.reduce<Record<string, Version[]>>((acc, v: Record<string, unknown>) => {
    const gid = v.trial_group_id as string
    if (!acc[gid]) acc[gid] = []
    acc[gid].push(mapVersion(v))
    return acc
  }, {})

  return groups.map((g: Record<string, unknown>) => mapGroup(g, versionsByGroup[g.id as string] || []))
}

export async function fetchTrialGroup(supabase: SupabaseClient, id: string): Promise<TrialGroup | null> {
  const { data: group, error: gErr } = await supabase
    .from('trial_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (gErr || !group) return null

  const { data: versions } = await supabase
    .from('versions')
    .select('*')
    .eq('trial_group_id', id)
    .order('version_number', { ascending: true })

  return mapGroup(group as Record<string, unknown>, (versions || []).map(mapVersion))
}
