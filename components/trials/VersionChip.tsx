import { Version } from '@/lib/types'
import { Crown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface VersionChipProps {
  version: Version
  onClick?: () => void
  active?: boolean
}

export default function VersionChip({ version, onClick, active }: VersionChipProps) {
  const isWinner = version.isWinner
  const isPublished = version.isPublished
  const hasStats = version.views > 0

  let chipClass = 'border-[#e8d5c4] bg-[#f0e6d3] text-[#8a5a70]'
  if (isWinner) chipClass = 'border-[#F5B942]/50 bg-[#F5B942]/20 text-[#b87d00]'
  else if (isPublished) chipClass = 'border-[#45132c]/30 bg-[#45132c]/10 text-[#45132c]'
  else if (active) chipClass = 'border-[#45132c]/30 bg-[#45132c]/5 text-[#45132c]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${chipClass} ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
    >
      {isWinner && <Crown size={10} className="text-[#b87d00]" />}
      <span>V{version.versionNumber}</span>
      {hasStats && (
        <span className="text-[10px] opacity-70">{formatNumber(version.views)}</span>
      )}
      {!hasStats && <span className="text-[10px] opacity-40">—</span>}
      {isPublished && !isWinner && (
        <span className="text-[10px] opacity-60">Published</span>
      )}
    </button>
  )
}
