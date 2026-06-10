'use client'

import { TrialGroup } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface OverviewCardsProps {
  groups: TrialGroup[]
}

export default function OverviewCards({ groups }: OverviewCardsProps) {
  const total = groups.length
  const won = groups.filter((g) => g.status === 'won').length
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0

  const allVersions = groups.flatMap((g) => g.versions)
  const winnerVersions = allVersions.filter((v) => v.isWinner)
  const nonWinnerVersions = allVersions.filter((v) => !v.isWinner && v.views > 0)
  const avgWinnerViews = winnerVersions.length > 0
    ? Math.round(winnerVersions.reduce((s, v) => s + v.views, 0) / winnerVersions.length)
    : 0
  const avgNonWinnerViews = nonWinnerVersions.length > 0
    ? Math.round(nonWinnerVersions.reduce((s, v) => s + v.views, 0) / nonWinnerVersions.length)
    : 0

  // Best content theme by avg winner views
  const themeViews: Record<string, number[]> = {}
  for (const g of groups) {
    const winnerV = g.versions.find((v) => v.isWinner)
    if (!winnerV) continue
    for (const theme of g.contentTheme) {
      if (!themeViews[theme]) themeViews[theme] = []
      themeViews[theme].push(winnerV.views)
    }
  }
  let bestTheme = '—'
  let bestThemeAvg = 0
  for (const [theme, views] of Object.entries(themeViews)) {
    const avg = views.reduce((s, v) => s + v, 0) / views.length
    if (avg > bestThemeAvg) { bestThemeAvg = avg; bestTheme = theme }
  }

  const cards = [
    { label: 'Total Trial Groups', value: String(total), sub: `${won} completed` },
    { label: 'Win Rate', value: `${winRate}%`, sub: `${won} of ${total} groups` },
    {
      label: 'Avg Views',
      value: formatNumber(avgWinnerViews),
      sub: `Winners vs ${formatNumber(avgNonWinnerViews)} non-winners`,
    },
    { label: 'Best Theme', value: bestTheme === '—' ? '—' : bestTheme.split('/')[0], sub: bestTheme === '—' ? 'No data yet' : `${formatNumber(bestThemeAvg)} avg winner views` },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 animate-fadeIn">
          <p className="text-xs text-[#666] mb-1">{c.label}</p>
          <p className="text-2xl font-bold text-white mb-0.5">{c.value}</p>
          <p className="text-xs text-[#555]">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
