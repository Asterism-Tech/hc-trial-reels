'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroups } from '@/lib/data'
import { TrialGroup } from '@/lib/types'
import OverviewCards from '@/components/analytics/OverviewCards'
import Badge, { statusBadgeVariant } from '@/components/ui/Badge'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Film } from 'lucide-react'

export default function DashboardPage() {
  const [groups, setGroups] = useState<TrialGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<{ short: string; suggestion: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrialGroups(supabase)
      setGroups(data)

      // Load cached insights
      const { data: cache } = await supabase.from('ai_insights_cache').select('*').eq('id', 1).single()
      if (cache?.insights) {
        setInsights({
          short: cache.insights.shortTermInsights?.[0] || '',
          suggestion: cache.insights.contentSuggestions?.[0] || '',
        })
      }

      setLoading(false)
    }
    load()
  }, [])

  const recent = groups.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#666] text-sm mt-1">Overview of your Trial Reel performance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : (
        <OverviewCards groups={groups} />
      )}

      {/* Recent Trials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Trials</h2>
          <Link href="/trials" className="text-xs text-[#6B2D8B] hover:text-[#9B4DBB] flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title="No trial groups yet"
            description="Add your first trial group on the Trials page"
            icon={<Film />}
            action={
              <Link href="/trials" className="px-4 py-2 bg-[#6B2D8B] text-white text-sm rounded-lg hover:bg-[#7B3D9B] transition-colors">
                Go to Trials
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {recent.map((g) => (
              <Link
                key={g.id}
                href={`/trials/${g.id}`}
                className="flex items-center justify-between bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 hover:border-[#3A3A3A] transition-colors group animate-fadeIn"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#A855D4] transition-colors">
                      {g.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusBadgeVariant(g.status)}>
                        {g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-[#555]">{g.testType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-[#555]">{formatDate(g.publishDate)}</p>
                    <p className="text-xs text-[#888]">{g.versions.length} version{g.versions.length !== 1 ? 's' : ''}</p>
                  </div>
                  <ArrowRight size={14} className="text-[#444] group-hover:text-[#6B2D8B] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Insights */}
      {insights && (insights.short || insights.suggestion) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Quick Insights</h2>
            <Link href="/ai" className="text-xs text-[#6B2D8B] hover:text-[#9B4DBB] flex items-center gap-1">
              Full AI view <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.short && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] border-l-[#F5B942] border-l-2 rounded-xl p-4 animate-fadeIn">
                <p className="text-xs font-medium text-[#F5B942] mb-1">💡 Short-term</p>
                <p className="text-sm text-[#ccc]">{insights.short}</p>
              </div>
            )}
            {insights.suggestion && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] border-l-[#22C55E] border-l-2 rounded-xl p-4 animate-fadeIn">
                <p className="text-xs font-medium text-[#22C55E] mb-1">🎯 Content Idea</p>
                <p className="text-sm text-[#ccc]">{insights.suggestion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
