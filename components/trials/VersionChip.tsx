import { Version, TrialStatus } from '@/lib/types'
import { Crown, Archive } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { versionColor, ARCHIVED_COLOR } from '@/lib/version-colors'

interface VersionChipProps {
  version: Version
  groupStatus?: TrialStatus
  onClick?: () => void
  active?: boolean
}

export default function VersionChip({ version, groupStatus, onClick, active }: VersionChipProps) {
  const isWinner = version.isWinner
  // Once a trial has a winner, the winner is the published reel and the rest are archived
  const isArchived = !isWinner && (groupStatus === 'won' || groupStatus === 'archived')
  const hasStats = version.views > 0
  const color = versionColor(version.versionNumber)

  if (isWinner) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ed4a7e] text-white border border-[#ed4a7e] shadow-[0_2px_8px_rgba(237,74,126,0.35)] transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_12px_rgba(237,74,126,0.45)] ${onClick ? 'hover:bg-[#d63a6c] cursor-pointer' : 'cursor-default'}`}
      >
        <Crown size={11} className="text-[#ffd966] animate-crownTwinkle" fill="#ffd966" />
        <span>V{version.versionNumber}</span>
        <span className="text-[10px] font-medium text-white/90">
          {hasStats ? formatNumber(version.views) : 'Winner'}
        </span>
        <span className="text-[9px] uppercase tracking-wide bg-white/20 rounded px-1 py-px">Published</span>
      </button>
    )
  }

  if (isArchived) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed text-xs font-medium transition-all ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
        style={{ borderColor: ARCHIVED_COLOR, color: ARCHIVED_COLOR, backgroundColor: '#f4f1f2' }}
      >
        <Archive size={10} />
        <span>V{version.versionNumber}</span>
        {hasStats && <span className="text-[10px] opacity-70">{formatNumber(version.views)}</span>}
        <span className="text-[9px] uppercase tracking-wide opacity-70">Archived</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all duration-200 hover:scale-105 ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'} ${active ? 'ring-2 ring-offset-1' : ''}`}
      style={{
        borderColor: color,
        color,
        backgroundColor: color + '14',
        ...(active ? { ['--tw-ring-color' as string]: color } : {}),
      }}
    >
      <span>V{version.versionNumber}</span>
      {hasStats ? (
        <span className="text-[10px] opacity-80">{formatNumber(version.views)}</span>
      ) : (
        <span className="text-[10px] opacity-40">—</span>
      )}
    </button>
  )
}
