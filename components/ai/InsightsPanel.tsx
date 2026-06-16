'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Lightbulb, BarChart2, Target, AlertTriangle, Sparkles, Brain } from 'lucide-react'
import { TrialGroup, AIInsights } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'
import CraftLoader from '@/components/ui/CraftLoader'
import type { WinnerPrediction } from '@/app/api/predict-winner/route'

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

const CONFIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Low confidence', color: '#a07080' },
  medium: { label: 'Medium confidence', color: '#F59E0B' },
  high: { label: 'High confidence', color: '#16A34A' },
}

export default function InsightsPanel({ groups }: InsightsPanelProps) {
  const [insights, setInsights] = useState<CachedInsights | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [predictions, setPredictions] = useState<WinnerPrediction[]>([])
  const [predictionsLoading, setPredictionsLoading] = useState(false)

  useEffect(() => {
    const loadCached = async () => {
      const { data } = await supabase.from('ai_insights_cache').select('*').eq('id', 1).single()
      if (data?.insights) {
        setInsights({ ...(data.insights as AIInsights), refreshedAt: data.refreshed_at, fromCache: true })
      }
    }
    loadCached()
  }, [])

  // Predicted winner — fetch when conditions are met:
  //   1. At least one historical trial has 3d snapshot data
  //   2. At least one live trial has 24h data but no winner yet
  useEffect(() => {
    const historicalGroups = groups.filter((g) =>
      g.versions.some((v) => v.snapshots.some((s) => s.takenAt === '3d' && s.views > 0))
    )
    const liveGroups = groups.filter(
      (g) =>
        g.status === 'live' &&
        !g.versions.some((v) => v.isWinner) &&
        g.versions.some((v) => v.snapshots.some((s) => s.takenAt === '24h' && s.views > 0))
    )

    if (historicalGroups.length === 0 || liveGroups.length === 0) return

    setPredictionsLoading(true)
    fetch('/api/predict-winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveGroups, historicalGroups }),
    })
      .then((r) => r.json())
      .then((data) => setPredictions(data.predictions ?? []))
      .catch(() => {/* silent — predictions are bonus content */})
      .finally(() => setPredictionsLoading(false))
  }, [groups])

  const generateInsights = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialData: groups, forceRefresh: true }),
      })
      if (res.status === 429) { setError('Rate limit reached. Try again later.'); return }
      if (!res.ok) { setError('Failed to generate insights'); return }
      const data = await res.json()
      setInsights(data)
    } catch {
      setError('Failed to generate insights')
    } finally {
      setGenerating(false)
    }
  }

  if (groups.length === 0) return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#e8d5c4] rounded-xl p-6 text-center shadow-[0_2px_8px_rgba(69,19,44,0.06)]">
        <p className="text-[#a07080] text-sm">Add some trial groups first to generate insights.</p>
      </div>
    </div>
  )

  if (generating) return <CraftLoader />

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fadeIn">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Predicted Winner section */}
      {(predictions.length > 0 || predictionsLoading) && (
        <div className="bg-white border border-[#e8d5c4] rounded-xl p-4 animate-slideUp shadow-[0_2px_8px_rgba(69,19,44,0.06)]" style={{ borderLeftColor: '#7C3AED', borderLeftWidth: 3 }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={15} className="text-[#7C3AED]" />
            <div>
              <h3 className="text-sm font-semibold text-[#45132c]">AI Predicted Winners</h3>
              <p className="text-[10px] text-[#a07080]">Based on historical patterns — prediction, not fact</p>
            </div>
          </div>
          {predictionsLoading ? (
            <p className="text-xs text-[#a07080] animate-pulse">Analysing patterns...</p>
          ) : (
            <ul className="space-y-2">
              {predictions.map((p) => {
                const conf = CONFIDENCE_LABELS[p.confidence] ?? CONFIDENCE_LABELS.low
                return (
                  <li key={p.groupId} className="text-xs">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-semibold text-[#45132c] truncate">{p.groupName}:</span>
                      <span className="text-[#7C3AED] font-semibold">AI thinks V{p.predictedWinnerVersionNumber} may grow</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: conf.color + '1a', color: conf.color }}
                      >
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-[#8a5a70] mt-0.5 leading-snug">{p.reasoning}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {!insights ? (
        <div className="bg-white border-2 border-dashed border-[#f5a3c7]/60 rounded-xl p-8 text-center animate-fadeIn">
          <Sparkles size={28} className="text-[#ed4a7e] mx-auto mb-3 animate-floaty" />
          <h3 className="text-sm font-semibold text-[#45132c] mb-1">No insights generated yet</h3>
          <p className="text-xs text-[#a07080] mb-4 max-w-xs mx-auto">
            Analyse your trial data with AI to spot trends, content ideas and warnings.
          </p>
          <button
            onClick={generateInsights}
            className="pressable inline-flex items-center gap-2 px-5 py-2.5 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
          >
            <Sparkles size={15} />
            Generate Insights
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-[#a07080] px-1">
            <span>Last generated {timeAgo(insights.refreshedAt)}</span>
            <button
              onClick={generateInsights}
              className="pressable flex items-center gap-1.5 px-3 py-1.5 bg-[#45132c] hover:bg-[#ed4a7e] text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <RefreshCw size={11} />
              Regenerate
            </button>
          </div>

          {SECTIONS.map((section, i) => (
            <div
              key={section.key}
              className={`bg-white border border-[#e8d5c4] rounded-xl p-4 animate-slideUp stagger-${i + 1} hover-lift shadow-[0_2px_8px_rgba(69,19,44,0.06)]`}
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
                {(insights[section.key] as string[]).map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-[#5a2040]">
                    <span className="text-[#dcc8b0] mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
