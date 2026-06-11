'use client'

import { Version } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface VersionComparisonTableProps {
  versions: Version[]
}

type RowDef = {
  label: string
  key: keyof Version
  format?: (val: unknown) => string
}

const rows: RowDef[] = [
  { label: 'Hook Type', key: 'hookType' },
  { label: 'Hook Text', key: 'hookText' },
  { label: 'Differences', key: 'differences' },
  { label: 'Platform', key: 'platform', format: (v) => (Array.isArray(v) ? (v as string[]).join(', ') : String(v || '—')) },
  { label: 'Video Length', key: 'videoLengthSeconds', format: (v) => v ? `${v}s` : '—' },
  { label: 'Face on Camera', key: 'faceOnCamera', format: (v) => v ? 'Yes' : 'No' },
  { label: 'Has Voiceover', key: 'hasVoiceover', format: (v) => v ? 'Yes' : 'No' },
  { label: 'Audio Type', key: 'audioType' },
  { label: 'Text Overlay', key: 'textOverlay', format: (v) => v ? 'Yes' : 'No' },
  { label: 'CTAs Used', key: 'ctaUsed', format: (v) => (Array.isArray(v) ? (v as string[]).join(', ') || '—' : String(v || '—')) },
  { label: 'Target Age', key: 'targetAgeGroup' },
  { label: 'Views', key: 'views', format: (v) => formatNumber(Number(v)) },
  { label: 'Accounts Reached', key: 'accountsReached', format: (v) => formatNumber(Number(v)) },
  { label: 'Likes', key: 'likes', format: (v) => formatNumber(Number(v)) },
  { label: 'Comments', key: 'comments', format: (v) => formatNumber(Number(v)) },
  { label: 'Shares', key: 'shares', format: (v) => formatNumber(Number(v)) },
  { label: 'Saves', key: 'saves', format: (v) => formatNumber(Number(v)) },
  { label: 'Profile Visits', key: 'profileVisits', format: (v) => formatNumber(Number(v)) },
  { label: 'Followers Gained', key: 'followersGained', format: (v) => formatNumber(Number(v)) },
  { label: 'Watch Time', key: 'watchTimeSeconds', format: (v) => v ? `${v}s` : '—' },
  { label: 'Completion Rate', key: 'completionRatePct', format: (v) => `${v}%` },
]

function getCellValue(version: Version, row: RowDef): string {
  const raw = version[row.key]
  if (row.format) return row.format(raw)
  if (raw === null || raw === undefined || raw === '') return '—'
  return String(raw)
}

function rowDiffers(versions: Version[], row: RowDef): boolean {
  if (versions.length < 2) return false
  const vals = versions.map((v) => getCellValue(v, row))
  return new Set(vals).size > 1
}

export default function VersionComparisonTable({ versions }: VersionComparisonTableProps) {
  if (versions.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8d5c4]">
            <th className="text-left text-xs text-[#a07080] font-medium py-2 pr-4 w-36">Field</th>
            {versions.map((v) => (
              <th key={v.id} className="text-left text-xs font-medium py-2 px-2 min-w-[140px]">
                <span className={`${v.isWinner ? 'text-[#b87d00]' : 'text-[#8a5a70]'}`}>
                  V{v.versionNumber} {v.isWinner ? '👑' : ''}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const differs = rowDiffers(versions, row)
            return (
              <tr
                key={row.key}
                className={`border-b border-[#f0e6d3] ${differs ? 'bg-amber-50' : ''}`}
              >
                <td className={`py-1.5 pr-4 text-xs ${differs ? 'text-amber-700' : 'text-[#8a5a70]'} font-medium`}>
                  {row.label}
                  {differs && <span className="ml-1 text-[10px] text-amber-600">●</span>}
                </td>
                {versions.map((v) => (
                  <td key={v.id} className="py-1.5 px-2 text-xs text-[#5a2040] max-w-[200px] truncate">
                    {getCellValue(v, row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
