import { Version, Snapshot } from './types'

// ── Relative group scoring ────────────────────────────────────────────────────
// Success score is calculated relative to sibling versions at the same snapshot
// point, so a version with 200 views isn't unfairly beaten by one with 200k.
// Weights per the brief: completion 35%, watch-time 25%, saves 20%, shares 10%,
// likes 10%.

export interface SnapshotForScoring {
  snap: Snapshot
  videoLengthSeconds: number
}

function watchTimeNorm(snap: Snapshot, videoLengthSeconds: number): number {
  if (videoLengthSeconds > 0) return Math.min(snap.watchTimeSeconds / videoLengthSeconds, 1)
  return Math.min(snap.watchTimeSeconds / 30, 1) // 30s full-watch fallback
}

/**
 * Calculate relative 0–100 success scores for a group of snapshots at the same
 * time point. Returns null for any entry that has no data (views === 0).
 */
export function calculateGroupScores(items: SnapshotForScoring[]): (number | null)[] {
  const hasData = items.map(({ snap }) => snap.views > 0)
  if (!hasData.some(Boolean)) return items.map(() => null)

  const active = items.filter((_, i) => hasData[i])

  const maxCompletion = Math.max(...active.map(({ snap }) => snap.completionRatePct))
  const maxWatch = Math.max(...active.map(({ snap, videoLengthSeconds }) => watchTimeNorm(snap, videoLengthSeconds)))
  const maxSaves = Math.max(...active.map(({ snap }) => snap.saves))
  const maxShares = Math.max(...active.map(({ snap }) => snap.shares))
  const maxLikes = Math.max(...active.map(({ snap }) => snap.likes))

  const norm = (val: number, max: number) => (max > 0 ? Math.min(val / max, 1) : 0)

  return items.map(({ snap, videoLengthSeconds }, i) => {
    if (!hasData[i]) return null
    const score =
      0.35 * norm(snap.completionRatePct, maxCompletion) +
      0.25 * norm(watchTimeNorm(snap, videoLengthSeconds), maxWatch) +
      0.20 * norm(snap.saves, maxSaves) +
      0.10 * norm(snap.shares, maxShares) +
      0.10 * norm(snap.likes, maxLikes)
    return Math.round(score * 100)
  })
}

/** Colour band for a score badge — green ≥ 70, amber 40–69, red < 40. */
export function scoreColor(score: number): string {
  if (score >= 70) return '#16A34A'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

// ── Legacy single-version absolute scoring ───────────────────────────────────
// Used where the full peer group isn't available (export, VersionComparisonTable
// fallback). New code should prefer calculateGroupScores.

export interface ScoreWeight {
  label: string
  weight: number
}

const COMPONENTS = {
  completion: { weight: 0.30, benchmark: 1 },
  engagement: { weight: 0.20, benchmark: 0.1 },
  saves: { weight: 0.15, benchmark: 0.03 },
  shares: { weight: 0.1, benchmark: 0.02 },
  followers: { weight: 0.1, benchmark: 0.02 },
  profileVisits: { weight: 0.1, benchmark: 0.05 },
  watch: { weight: 0.05, benchmark: 1 },
} as const

const safeRate = (num: number, den: number) => (den > 0 ? num / den : 0)
const capped = (rate: number, benchmark: number) =>
  benchmark > 0 ? Math.min(rate / benchmark, 1) : 0

export function successScore(v: Version): number | null {
  if (!v.views || v.views === 0) return null

  const completion = (v.completionRatePct || 0) / 100
  const engagement = safeRate(v.likes + v.comments + v.shares + v.saves, v.views)
  const saves = safeRate(v.saves, v.views)
  const shares = safeRate(v.shares, v.views)
  const followers = safeRate(v.followersGained, v.accountsReached || v.views)
  const profileVisits = safeRate(v.profileVisits, v.views)
  const watch = v.videoLengthSeconds
    ? safeRate(v.watchTimeSeconds, v.videoLengthSeconds)
    : capped(v.watchTimeSeconds, 30)

  const score =
    COMPONENTS.completion.weight * capped(completion, COMPONENTS.completion.benchmark) +
    COMPONENTS.engagement.weight * capped(engagement, COMPONENTS.engagement.benchmark) +
    COMPONENTS.saves.weight * capped(saves, COMPONENTS.saves.benchmark) +
    COMPONENTS.shares.weight * capped(shares, COMPONENTS.shares.benchmark) +
    COMPONENTS.followers.weight * capped(followers, COMPONENTS.followers.benchmark) +
    COMPONENTS.profileVisits.weight * capped(profileVisits, COMPONENTS.profileVisits.benchmark) +
    COMPONENTS.watch.weight * Math.min(watch, 1)

  return Math.round(score * 100)
}

export function topScoringVersion(versions: Version[]): Version | null {
  let best: Version | null = null
  let bestScore = -1
  for (const v of versions) {
    const s = successScore(v)
    if (s !== null && s > bestScore) {
      bestScore = s
      best = v
    }
  }
  return best
}
