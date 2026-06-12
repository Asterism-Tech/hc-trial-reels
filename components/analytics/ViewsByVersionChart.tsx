'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { TrialGroup } from '@/lib/types'
import { formatNumber } from '@/lib/utils'
import { VERSION_COLORS, WINNER_COLOR } from '@/lib/version-colors'

interface Props { groups: TrialGroup[] }

export default function ViewsByVersionChart({ groups }: Props) {
  const data = groups
    .filter((g) => g.versions.some((v) => v.views > 0))
    .map((g) => {
      const row: Record<string, unknown> = { name: g.name.length > 20 ? g.name.slice(0, 20) + '…' : g.name }
      g.versions.forEach((v) => {
        row[`V${v.versionNumber}`] = v.views
        row[`V${v.versionNumber}_winner`] = v.isWinner
      })
      return row
    })

  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#a07080] text-sm">No view data yet</div>
  )

  const maxVersions = Math.max(...groups.map((g) => g.versions.length))
  const versionKeys = Array.from({ length: maxVersions }, (_, i) => `V${i + 1}`)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 30, left: 10 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#8a5a70' }}
          axisLine={false}
          tickLine={false}
          angle={-20}
          textAnchor="end"
        />
        <YAxis tick={{ fontSize: 10, fill: '#8a5a70' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
        <Tooltip
          contentStyle={{ background: '#ffffff', border: '1px solid #e8d5c4', borderRadius: 8, fontSize: 11, color: '#45132c' }}
          formatter={(val: unknown) => [formatNumber(Number(val)), '']}
          cursor={{ fill: '#45132c08' }}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: '#8a5a70' }} />
        {versionKeys.map((key, i) => (
          <Bar key={key} dataKey={key} radius={[3, 3, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry[`${key}_winner`] ? WINNER_COLOR : VERSION_COLORS[i % VERSION_COLORS.length]}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
