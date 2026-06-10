'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Film,
  BarChart2,
  Sparkles,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trials', label: 'Trials', icon: Film },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/ai', label: 'AI Insights', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full bg-[#1A1A1A] border-r border-[#2A2A2A] z-40 flex flex-col transition-all duration-200 w-14 lg:w-56 xl:w-60">
      {/* Logo */}
      <div className="px-3 lg:px-5 py-5 border-b border-[#2A2A2A] flex items-center justify-center lg:justify-start">
        <span className="text-xl font-bold text-[#6B2D8B] hidden lg:block tracking-tight">
          Hobbycraft
        </span>
        <span className="text-xs text-[#888] mt-0.5 hidden lg:block ml-1">&nbsp;Reel Hub</span>
        <span className="text-xl font-bold text-[#6B2D8B] lg:hidden">H</span>
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
              className={`flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? 'bg-[#6B2D8B]/20 text-[#6B2D8B]'
                  : 'text-[#999] hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden lg:block truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 lg:px-5 py-4 border-t border-[#2A2A2A] flex justify-center lg:justify-start">
        <p className="text-[10px] text-[#555] hidden lg:block">v1.0.0</p>
        <p className="text-[10px] text-[#555] lg:hidden">···</p>
      </div>
    </aside>
  )
}
