import { Version } from './types'

// Success score — a single 0–100 number summarising how well a version
// performed, so winners are easier to spot at a glance and to compare across
// trials. Per the brief, watch-through (completion) is valued most highly,
// followed by the engagement signals that drive reach (saves, shares), then
// the conversion signals (followers, profile visits).
//
// Each metric is turned into a *rate* (relative to views/reach) so a version
// with 2k views isn't unfairly beaten by one with 200k. Each rate is then
// capped at a "great" benchmark = full marks for that component.

export interface ScoreWeight {
  label: string
  weight: number
}

// Benchmarks for "full marks" on each rate, and the weight each carries.
const COMPONENTS = {
  completion: { weight: 0.30, benchmark: 1 }, // completion rate (0–1)
  engagement: { weight: 0.20, benchmark: 0.1 }, // (likes+comments+shares+saves)/views
  saves: { weight: 0.15, benchmark: 0.03 }, // saves/views
  shares: { weight: 0.1, benchmark: 0.02 }, // shares/views
  followers: { weight: 0.1, benchmark: 0.02 }, // followersGained/accountsReached
  profileVisits: { weight: 0.1, benchmark: 0.05 }, // profileVisits/views
  watch: { weight: 0.05, benchmark: 1 }, // watchTime / videoLength (full watch)
} as const

const safeRate = (num: number, den: number) => (den > 0 ? num / den : 0)
const capped = (rate: number, benchmark: number) =>
  benchmark > 0 ? Math.min(rate / benchmark, 1) : 0

/**
 * Returns a 0–100 success score, or null if the version has no data yet
 * (no point scoring a reel whose numbers haven't been entered).
 */
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

/** Colour band for a score badge — green = strong, amber = mid, grey = weak. */
export function scoreColor(score: number): string {
  if (score >= 70) return '#16A34A' // green — strong
  if (score >= 45) return '#F59E0B' // amber — middling
  return '#9b8a92' // muted — weak
}

/** The version with the highest success score, if any have data. */
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
