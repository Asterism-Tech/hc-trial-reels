'use client'

import { Version } from '@/lib/types'
import { formatNumber } from '@/lib/utils'
import { versionColor, WINNER_COLOR } from '@/lib/version-colors'
import { Crown, Check, Minus, TrendingUp } from 'lucide-react'

interface VersionComparisonTableProps {
  versions: Version[]
}

type Kind = 'text' | 'longtext' | 'bool' | 'number' | 'seconds' | 'pct' | 'list' | 'tags'

type RowDef = {
  label: string
  key: keyof Version
  kind: Kind
}

const SECTIONS: { title: string; rows: RowDef[] }[] = [
  {
    title: 'Content & Hook',
    rows: [
      { label: 'Version Tags', key: 'tags', kind: 'tags' },
      { label: 'Hook Type', key: 'hookType', kind: 'text' },
      { label: 'Hook Text', key: 'hookText', kind: 'longtext' },
      { label: "What's Different", key: 'differences', kind: 'longtext' },
    ],
  },
  {
    title: 'Format & Delivery',
    rows: [
      { label: 'Platform', key: 'platform', kind: 'list' },
      { label: 'Video Length', key: 'videoLengthSeconds', kind: 'seconds' },
      { label: 'Face on Camera', key: 'faceOnCamera', kind: 'bool' },
      { label: 'Voiceover', key: 'hasVoiceover', kind: 'bool' },
      { label: 'Audio Type', key: 'audioType', kind: 'text' },
      { label: 'Text Overlay', key: 'textOverlay', kind: 'bool' },
      { label: 'CTAs Used', key: 'ctaUsed', kind: 'list' },
      { label: 'Target Age', key: 'targetAgeGroup', kind: 'text' },
    ],
  },
  {
    title: 'Performance',
    rows: [
      { label: 'Views', key: 'views', kind: 'number' },
      { label: 'Accounts Reached', key: 'accountsReached', kind: 'number' },
      { label: 'Likes', key: 'likes', kind: 'number' },
      { label: 'Comments', key: 'comments', kind: 'number' },
      { label: 'Shares', key: 'shares', kind: 'number' },
      { label: 'Saves', key: 'saves', kind: 'number' },
      { label: 'Profile Visits', key: 'profileVisits', kind: 'number' },
      { label: 'Followers Gained', key: 'followersGained', kind: 'number' },
      { label: 'Watch Time', key: 'watchTimeSeconds', kind: 'seconds' },
      { label: 'Completion Rate', key: 'completionRatePct', kind: 'pct' },
    ],
  },
]

function displayValue(version: Version, row: RowDef): string {
  const raw = version[row.key]
  switch (row.kind) {
    case 'bool': return raw ? 'Yes' : 'No'
    case 'number': return formatNumber(Number(raw) || 0)
    case 'seconds': return raw ? `${raw}s` : '—'
    case 'pct': return `${raw ?? 0}%`
    case 'list':
    case 'tags': return Array.isArray(raw) ? (raw as string[]).join(', ') || '—' : '—'
    default: return raw === null || raw === undefined || raw === '' ? '—' : String(raw)
  }
}

function rowDiffers(versions: Version[], row: RowDef): boolean {
  if (versions.length < 2) return false
  return new Set(versions.map((v) => displayValue(v, row))).size > 1
}

function Cell({ version, row, isBest }: { version: Version; row: RowDef; isBest: boolean }) {
  const raw = version[row.key]
  const color = versionColor(version.versionNumber)

  if (row.kind === 'tags') {
    const tags = (raw as string[]) || []
    if (tags.length === 0) return <span className="text-[#c0a0b0]">—</span>
    return (
      <span className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
            style={{ backgroundColor: color + '14', color: version.isWinner ? '#c02860' : color }}
          >
            {tag}
          </span>
        ))}
      </span>
    )
  }

  if (row.kind === 'bool') {
    return raw ? (
      <Check size={14} className="text-[#ed4a7e]" strokeWidth={3} />
    ) : (
      <Minus size={14} className="text-[#dcc8b0]" />
    )
  }

  const text = displayValue(version, row)
  const isEmpty = text === '—' || text === '0' || text === '0%' || text === '0s'

  if (row.kind === 'number' || row.kind === 'pct' || (row.kind === 'seconds' && SECTIONS[2].rows.includes(row))) {
    return (
      <span className={`font-mono tabular-nums inline-flex items-center gap-1 ${
        isBest ? 'text-[#ed4a7e] font-bold' : isEmpty ? 'text-[#c0a0b0]' : 'text-[#5a2040]'
      }`}>
        {text}
        {isBest && <TrendingUp size={11} />}
      </span>
    )
  }

  if (row.kind === 'longtext') {
    return (
      <span className={`block max-w-[220px] leading-snug ${isEmpty ? 'text-[#c0a0b0]' : 'text-[#5a2040]'}`} title={text === '—' ? undefined : text}>
        {text}
      </span>
    )
  }

  return <span className={isEmpty ? 'text-[#c0a0b0]' : 'text-[#5a2040]'}>{text}</span>
}

export default function VersionComparisonTable({ versions }: VersionComparisonTableProps) {
  if (versions.length === 0) return null

  // In the performance section the interesting signal is the best value per
  // row, not "values differ" (numbers nearly always differ).
  const bestValue = (row: RowDef): number => {
    const vals = versions.map((v) => Number(v[row.key]) || 0)
    const max = Math.max(...vals)
    return max > 0 ? max : NaN
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#f0e6d3]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#faf9f7]">
            <th className="text-left text-[10px] text-[#a07080] font-semibold uppercase tracking-wider py-2.5 px-3 w-40 sticky left-0 bg-[#faf9f7] z-10" />
            {versions.map((v) => (
              <th
                key={v.id}
                className="text-left text-xs font-semibold py-2.5 px-3 min-w-[150px]"
                style={v.isWinner ? { backgroundColor: '#fdf2f6' } : undefined}
              >
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-transform duration-200 hover:scale-105"
                  style={v.isWinner
                    ? { backgroundColor: WINNER_COLOR, color: '#ffffff', boxShadow: '0 2px 8px rgba(237,74,126,0.3)' }
                    : { backgroundColor: versionColor(v.versionNumber) + '14', color: versionColor(v.versionNumber) }}
                >
                  {v.isWinner && <Crown size={11} className="text-[#ffd966]" fill="#ffd966" />}
                  V{v.versionNumber}
                  {v.isWinner && <span className="text-[9px] uppercase tracking-wide opacity-90">Winner</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section, sIdx) => {
            const isPerformance = sIdx === 2
            return [
              <tr key={section.title}>
                <td
                  colSpan={versions.length + 1}
                  className="pt-4 pb-1.5 px-3 text-[10px] font-bold text-[#ed4a7e] uppercase tracking-[0.12em] border-b-2 border-dashed border-[#f5a3c7]/60 sticky left-0"
                >
                  {section.title}
                </td>
              </tr>,
              ...section.rows.map((row) => {
                const differs = !isPerformance && rowDiffers(versions, row)
                const best = isPerformance ? bestValue(row) : NaN
                return (
                  <tr
                    key={String(row.key)}
                    className="border-b border-[#f7f1e8] last:border-0 hover:bg-[#faf9f7]/80 transition-colors duration-150 group"
                  >
                    <td className="py-2 px-3 text-xs text-[#8a5a70] font-medium sticky left-0 bg-white group-hover:bg-[#faf9f7] transition-colors duration-150 align-top">
                      <span className="inline-flex items-center gap-1.5">
                        {row.label}
                        {differs && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#ed4a7e] shrink-0"
                            title="Versions differ on this"
                          />
                        )}
                      </span>
                    </td>
                    {versions.map((v) => {
                      const isBest = isPerformance && !isNaN(best) && (Number(v[row.key]) || 0) === best
                      return (
                        <td
                          key={v.id}
                          className="py-2 px-3 text-xs align-top"
                          style={v.isWinner ? { backgroundColor: '#fdf2f6' } : undefined}
                        >
                          <Cell version={v} row={row} isBest={isBest} />
                        </td>
                      )
                    })}
                  </tr>
                )
              }),
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}
