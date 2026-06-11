'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrialGroup } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface Props { groups: TrialGroup[] }

export default function HookTypeChart({ groups }: Props) {
  const hookStats: Record<string, { views: number[]; saves: number[] }> = {}

  for (const g of groups) {
    for (const v of g.versions) {
      if (!v.hookType) continue
      if (!hookStats[v.hookType]) hookStats[v.hookType] = { views: [], saves: [] }
      if (v.views > 0) hookStats[v.hookType].views.push(v.views)
      if (v.saves > 0) hookStats[v.hookType].saves.push(v.saves)
    }
  }

  const data = Object.entries(hookStats).map(([type, stats]) => ({
    hookType: type,
    avgViews: stats.views.length > 0 ? Math.round(stats.views.reduce((s, v) => s + v, 0) / stats.views.length) : 0,
    avgSaves: stats.saves.length > 0 ? Math.round(stats.saves.reduce((s, v) => s + v, 0) / stats.saves.length) : 0,
  }))

  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#a07080] text-sm">No hook type data yet</div>
  )

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis dataKey="hookType" tick={{ fontSize: 11, fill: '#8a5a70' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#8a5a70' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
        <Tooltip
          contentStyle={{ background: '#ffffff', border: '1px solid #e8d5c4', borderRadius: 8, fontSize: 11, color: '#45132c' }}
          formatter={(val: unknown) => [formatNumber(Number(val)), '']}
          cursor={{ fill: '#45132c08' }}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: '#8a5a70' }} />
        <Bar dataKey="avgViews" name="Avg Views" fill="#45132c" radius={[3, 3, 0, 0]} />
        <Bar dataKey="avgSaves" name="Avg Saves" fill="#ed4a7e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
