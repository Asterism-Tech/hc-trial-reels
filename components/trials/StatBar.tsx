'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Version } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface StatBarProps {
  versions: Version[]
  stat: keyof Pick<Version, 'views' | 'completionRatePct' | 'saves' | 'likes'>
  label: string
  unit?: string
}

export default function StatBar({ versions, stat, label, unit = '' }: StatBarProps) {
  const data = versions.map((v) => ({
    name: `V${v.versionNumber}`,
    value: v[stat] as number,
    isWinner: v.isWinner,
  }))

  return (
    <div>
      <p className="text-xs text-[#888] mb-1">{label}</p>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 11 }}
            formatter={(val: unknown) => [`${formatNumber(Number(val))}${unit}`, label]}
            cursor={{ fill: '#2A2A2A' }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isWinner ? '#F5B942' : '#6B2D8B'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
