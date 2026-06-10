'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrialGroup } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props { groups: TrialGroup[] }

const LINE_COLORS = ['#6B2D8B', '#F5B942', '#22C55E', '#3B82F6', '#EC4899']

export default function CompletionTrendChart({ groups }: Props) {
  const sorted = [...groups]
    .filter((g) => g.publishDate && g.versions.some((v) => v.completionRatePct > 0))
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate))

  if (sorted.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#555] text-sm">No completion data yet</div>
  )

  // Build a flat timeline per version of each group
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
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 11 }}
          formatter={(val: unknown, name: unknown) => [`${val}%`, String(name)]}
          cursor={{ stroke: '#2A2A2A' }}
        />
        <Legend wrapperStyle={{ fontSize: 9, color: '#666' }} />
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
