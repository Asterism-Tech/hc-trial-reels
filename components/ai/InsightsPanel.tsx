'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Lightbulb, BarChart2, Target, AlertTriangle } from 'lucide-react'
import { TrialGroup, AIInsights } from '@/lib/types'
import { timeAgo } from '@/lib/utils'
import SkeletonCard from '@/components/ui/SkeletonCard'

interface InsightsPanelProps {
  groups: TrialGroup[]
}

interface CachedInsights extends AIInsights {
  refreshedAt: string
  fromCache: boolean
}

const SECTIONS = [
  { key: 'shortTermInsights' as const, label: 'Short-term', emoji: '💡', description: 'Last 30 days', icon: Lightbulb, color: '#F5B942' },
  { key: 'longTermInsights' as const, label: 'Long-term', emoji: '📊', description: 'All time trends', icon: BarChart2, color: '#45132c' },
  { key: 'contentSuggestions' as const, label: 'Content Suggestions', emoji: '🎯', description: 'Ideas to test next', icon: Target, color: '#22C55E' },
  { key: 'watchOut' as const, label: 'Watch Out', emoji: '⚠️', description: 'Underperformance warnings', icon: AlertTriangle, color: '#EF4444' },
]

export default function InsightsPanel({ groups }: InsightsPanelProps) {
  const [insights, setInsights] = useState<CachedInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInsights = async (force = false) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialData: groups, forceRefresh: force }),
      })
      if (res.status === 429) { setError('Rate limit reached. Try again later.'); return }
      if (!res.ok) { setError('Failed to generate insights'); return }
      const data = await res.json()
      setInsights(data)
    } catch {
      setError('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (groups.length > 0) fetchInsights()
    else setLoading(false)
  }, [])

  if (groups.length === 0) return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#e8d5c4] rounded-xl p-6 text-center shadow-[0_2px_8px_rgba(69,19,44,0.06)]">
        <p className="text-[#a07080] text-sm">Add some trial groups first to generate insights.</p>
      </div>
    </div>
  )

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={3} />)}
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={() => fetchInsights()} className="mt-2 text-xs text-red-500 hover:text-red-700 underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-3">
      {insights && (
        <div className="flex items-center justify-between text-xs text-[#a07080] px-1">
          <span>Last updated {timeAgo(insights.refreshedAt)}{insights.fromCache ? ' (cached)' : ''}</span>
          <button
            onClick={() => fetchInsights(true)}
            className="flex items-center gap-1 text-[#45132c] hover:text-[#ed4a7e] transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      )}

      {insights && SECTIONS.map((section) => (
        <div
          key={section.key}
          className="bg-white border border-[#e8d5c4] rounded-xl p-4 animate-fadeIn shadow-[0_2px_8px_rgba(69,19,44,0.06)]"
          style={{ borderLeftColor: section.color, borderLeftWidth: 3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">{section.emoji}</span>
            <div>
              <h3 className="text-sm font-semibold text-[#45132c]">{section.label}</h3>
              <p className="text-[10px] text-[#a07080]">{section.description}</p>
            </div>
          </div>
          <ul className="space-y-1.5">
            {(insights[section.key] as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#5a2040]">
                <span className="text-[#dcc8b0] mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
