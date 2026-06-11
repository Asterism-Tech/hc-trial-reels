import { TrialStatus } from '@/lib/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'gold' | 'grey' | 'green' | 'blue' | 'orange' | 'pink' | 'teal' | 'yellow'
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<string, string> = {
  purple: 'bg-[#45132c]/10 text-[#45132c] border border-[#45132c]/20',
  gold: 'bg-[#F5B942]/20 text-[#b87d00] border border-[#F5B942]/40',
  grey: 'bg-[#f0e6d3] text-[#8a5a70] border border-[#e8d5c4]',
  green: 'bg-green-50 text-green-700 border border-green-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  pink: 'bg-[#ed4a7e]/10 text-[#c02860] border border-[#ed4a7e]/30',
  teal: 'bg-teal-50 text-teal-700 border border-teal-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
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
