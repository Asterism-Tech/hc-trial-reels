'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { TrialGroup } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface Props { groups: TrialGroup[] }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function PublishDayChart({ groups }: Props) {
  const points = groups
    .filter((g) => g.publishDate)
    .flatMap((g) => {
      const day = new Date(g.publishDate).getDay()
      return g.versions
        .filter((v) => v.views > 0)
        .map((v) => ({
          day,
          views: v.views,
          name: `${g.name} V${v.versionNumber}`,
          isWinner: v.isWinner,
        }))
    })

  if (points.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#555] text-sm">No publish date data yet</div>
  )

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ScatterChart margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis
          type="number"
          dataKey="day"
          domain={[0, 6]}
          ticks={[0, 1, 2, 3, 4, 5, 6]}
          tickFormatter={(v) => DAYS[v]}
          tick={{ fontSize: 11, fill: '#666' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="views"
          tick={{ fontSize: 10, fill: '#666' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatNumber}
        />
        <Tooltip
          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 11 }}
          formatter={(val: unknown, name: unknown) => [String(name) === 'day' ? DAYS[Number(val)] : formatNumber(Number(val)), String(name) === 'day' ? 'Day' : 'Views']}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Scatter data={points} name="Posts">
          {points.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.isWinner ? '#F5B942' : '#6B2D8B'} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}
