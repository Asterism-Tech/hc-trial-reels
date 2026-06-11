'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrialGroup } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props { groups: TrialGroup[] }

const LINE_COLORS = ['#45132c', '#ed4a7e', '#22C55E', '#3B82F6', '#f5a3c7']

export default function CompletionTrendChart({ groups }: Props) {
  const sorted = [...groups]
    .filter((g) => g.publishDate && g.versions.some((v) => v.completionRatePct > 0))
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate))

  if (sorted.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#a07080] text-sm">No completion data yet</div>
  )

  const data = sorted.flatMap((g) =>
    g.versions
      .filter((v) => v.completionRatePct > 0)
      .map((v) => ({
        date: g.publishDate,
        name: `${g.name} V${v.versionNumber}`,
        rate: v.completionRatePct,
        isWinner: v.isWinner,
      }))
  )

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    [d.name]: d.rate,
  }))

  const keys = Array.from(new Set(data.map((d) => d.name)))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8a5a70' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#8a5a70' }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: '#ffffff', border: '1px solid #e8d5c4', borderRadius: 8, fontSize: 11, color: '#45132c' }}
          formatter={(val: unknown, name: unknown) => [`${val}%`, String(name)]}
          cursor={{ stroke: '#e8d5c4' }}
        />
        <Legend wrapperStyle={{ fontSize: 9, color: '#8a5a70' }} />
        {keys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
