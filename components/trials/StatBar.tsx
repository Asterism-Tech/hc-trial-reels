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
import { versionChartColor } from '@/lib/version-colors'

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
    color: versionChartColor(v.versionNumber, v.isWinner),
  }))

  return (
    <div>
      <p className="text-xs text-[#8a5a70] mb-1">{label}</p>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a5a70' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e8d5c4', borderRadius: 8, fontSize: 11, color: '#45132c' }}
            formatter={(val: unknown) => [`${formatNumber(Number(val))}${unit}`, label]}
            cursor={{ fill: '#f0e6d3' }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
