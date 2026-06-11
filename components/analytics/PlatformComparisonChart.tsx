'use client'

import { TrialGroup } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface Props { groups: TrialGroup[] }

interface PlatformStats {
  views: number[]
  completion: number[]
  saves: number[]
}

export default function PlatformComparisonChart({ groups }: Props) {
  const stats: Record<string, PlatformStats> = {
    Instagram: { views: [], completion: [], saves: [] },
    TikTok: { views: [], completion: [], saves: [] },
  }

  for (const g of groups) {
    for (const v of g.versions) {
      if (v.views === 0) continue
      for (const p of v.platform) {
        if (stats[p]) {
          stats[p].views.push(v.views)
          stats[p].completion.push(v.completionRatePct)
          stats[p].saves.push(v.saves)
        }
      }
    }
  }

  const platforms = Object.entries(stats).filter(([, s]) => s.views.length > 0)

  if (platforms.length === 0) return (
    <div className="flex items-center justify-center h-32 text-[#a07080] text-sm">No platform data yet</div>
  )

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0
  const avgPct = (arr: number[]) => arr.length > 0 ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : '0'

  const PLATFORM_COLORS: Record<string, string> = {
    Instagram: '#E1306C',
    TikTok: '#14B8A6',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {platforms.map(([platform, s]) => (
        <div
          key={platform}
          className="bg-[#faf9f7] border border-[#e8d5c4] rounded-xl p-4"
          style={{ borderTopColor: PLATFORM_COLORS[platform], borderTopWidth: 2 }}
        >
          <h4 className="font-semibold text-sm mb-3" style={{ color: PLATFORM_COLORS[platform] }}>
            {platform}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-[#8a5a70]">Avg Views</span>
              <span className="text-xs font-mono text-[#45132c]">{formatNumber(avg(s.views))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#8a5a70]">Avg Completion</span>
              <span className="text-xs font-mono text-[#45132c]">{avgPct(s.completion)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#8a5a70]">Avg Saves</span>
              <span className="text-xs font-mono text-[#45132c]">{formatNumber(avg(s.saves))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#8a5a70]">Versions tracked</span>
              <span className="text-xs font-mono text-[#8a5a70]">{s.views.length}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
