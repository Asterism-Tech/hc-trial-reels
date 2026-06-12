'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Film,
  BarChart2,
  Sparkles,
  Download,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trials', label: 'Trials', icon: Film },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/ai', label: 'AI Insights', icon: Sparkles },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full bg-white border-r border-[#e8d5c4] z-40 flex flex-col transition-all duration-200 w-14 lg:w-56 xl:w-60">
      {/* Logo */}
      <div className="px-3 lg:px-5 py-5 border-b border-[#e8d5c4] flex items-center justify-center lg:justify-start">
        <span className="text-xl font-bold text-[#45132c] hidden lg:block tracking-tight">
          Hobbycraft
        </span>
        <span className="text-xs text-[#a07080] mt-0.5 hidden lg:block ml-1">&nbsp;Reel Hub</span>
        <span className="text-xl font-bold text-[#45132c] lg:hidden">H</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-[#f5a3c7]/40 text-[#45132c]'
                  : 'text-[#8a5a70] hover:text-[#45132c] hover:bg-[#f5eee4] hover:translate-x-0.5'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#ed4a7e] rounded-r-full animate-popIn" />
              )}
              <Icon
                size={18}
                className={`shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110 group-hover:-rotate-3'}`}
              />
              <span className="hidden lg:block truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 lg:px-5 py-4 border-t border-[#e8d5c4] flex justify-center lg:justify-start">
        <p className="text-[10px] text-[#b09090] hidden lg:block">v1.0.0</p>
        <p className="text-[10px] text-[#b09090] lg:hidden">···</p>
      </div>
    </aside>
  )
}
