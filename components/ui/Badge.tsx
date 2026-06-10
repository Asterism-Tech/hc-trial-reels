import { TrialStatus } from '@/lib/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'gold' | 'grey' | 'green' | 'blue' | 'orange' | 'pink' | 'teal' | 'yellow'
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<string, string> = {
  purple: 'bg-[#6B2D8B]/20 text-[#A855D4] border border-[#6B2D8B]/30',
  gold: 'bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30',
  grey: 'bg-[#2A2A2A] text-[#888] border border-[#3A3A3A]',
  green: 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  teal: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

const statusVariantMap: Record<TrialStatus, string> = {
  live: 'purple',
  won: 'gold',
  archived: 'grey',
}

export function statusBadgeVariant(status: TrialStatus): BadgeProps['variant'] {
  return statusVariantMap[status] as BadgeProps['variant']
}

export default function Badge({ children, variant = 'grey', size = 'sm', className = '' }: BadgeProps) {
  const base = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
