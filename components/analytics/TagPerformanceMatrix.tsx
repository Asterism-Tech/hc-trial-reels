'use client'

import { TrialGroup } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface Props { groups: TrialGroup[] }

interface TagRow {
  tag: string
  avgViews: number
  avgCompletion: number
  winRate: number
  count: number
}

function getColor(val: number, min: number, max: number): string {
  if (max === min) return 'text-[#8a5a70]'
  const pct = (val - min) / (max - min)
  if (pct > 0.66) return 'text-[#22C55E]'
  if (pct > 0.33) return 'text-[#F5B942]'
  return 'text-red-500'
}

export default function TagPerformanceMatrix({ groups }: Props) {
  const tagStats: Record<string, { views: number[]; completion: number[]; wins: number; total: number }> = {}

  for (const g of groups) {
    const hasWinner = g.versions.some((v) => v.isWinner)
    for (const tag of g.tags) {
      if (!tagStats[tag]) tagStats[tag] = { views: [], completion: [], wins: 0, total: 0 }
      tagStats[tag].total++
      if (hasWinner) tagStats[tag].wins++
      for (const v of g.versions) {
        if (v.views > 0) tagStats[tag].views.push(v.views)
        if (v.completionRatePct > 0) tagStats[tag].completion.push(v.completionRatePct)
      }
    }
  }

  const rows: TagRow[] = Object.entries(tagStats).map(([tag, stats]) => ({
    tag,
    avgViews: stats.views.length > 0 ? Math.round(stats.views.reduce((s, v) => s + v, 0) / stats.views.length) : 0,
    avgCompletion: stats.completion.length > 0
      ? parseFloat((stats.completion.reduce((s, v) => s + v, 0) / stats.completion.length).toFixed(1))
      : 0,
    winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
    count: stats.total,
  })).sort((a, b) => b.winRate - a.winRate)

  if (rows.length === 0) return (
    <div className="flex items-center justify-center h-32 text-[#a07080] text-sm">No tagged trials yet</div>
  )

  const allViews = rows.map((r) => r.avgViews)
  const allComp = rows.map((r) => r.avgCompletion)
  const allWins = rows.map((r) => r.winRate)
  const minV = Math.min(...allViews), maxV = Math.max(...allViews)
  const minC = Math.min(...allComp), maxC = Math.max(...allComp)
  const minW = Math.min(...allWins), maxW = Math.max(...allWins)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8d5c4]">
            <th className="text-left text-xs text-[#a07080] font-medium py-2 pr-4">Tag</th>
            <th className="text-right text-xs text-[#a07080] font-medium py-2 px-3">Avg Views</th>
            <th className="text-right text-xs text-[#a07080] font-medium py-2 px-3">Avg Completion</th>
            <th className="text-right text-xs text-[#a07080] font-medium py-2 px-3">Win Rate</th>
            <th className="text-right text-xs text-[#a07080] font-medium py-2 pl-3">Trials</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.tag} className="border-b border-[#f0e6d3] hover:bg-[#faf9f7]">
              <td className="py-2 pr-4 text-xs text-[#5a2040] font-medium">{row.tag}</td>
              <td className={`py-2 px-3 text-xs text-right font-mono ${getColor(row.avgViews, minV, maxV)}`}>
                {formatNumber(row.avgViews)}
              </td>
              <td className={`py-2 px-3 text-xs text-right font-mono ${getColor(row.avgCompletion, minC, maxC)}`}>
                {row.avgCompletion}%
              </td>
              <td className={`py-2 px-3 text-xs text-right font-mono ${getColor(row.winRate, minW, maxW)}`}>
                {row.winRate}%
              </td>
              <td className="py-2 pl-3 text-xs text-right text-[#8a5a70]">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
