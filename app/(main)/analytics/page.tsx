'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroups } from '@/lib/data'
import { TrialGroup } from '@/lib/types'
import CompletionTrendChart from '@/components/analytics/CompletionTrendChart'
import TagPerformanceMatrix from '@/components/analytics/TagPerformanceMatrix'
import HookTypeChart from '@/components/analytics/HookTypeChart'
import PlatformComparisonChart from '@/components/analytics/PlatformComparisonChart'
import PublishDayChart from '@/components/analytics/PublishDayChart'
import SkeletonCard from '@/components/ui/SkeletonCard'

const CONTENT_THEMES = [
  'Ideas/Projects/How to', 'Product', 'Behind the Scenes',
  'Tutorial', 'Trending', 'User Generated', 'Seasonal',
]

const DATE_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: 0 },
]

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e8d5c4] rounded-xl p-5 animate-slideUp hover-lift shadow-[0_2px_8px_rgba(69,19,44,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#45132c]">{title}</h3>
        <p className="text-xs text-[#a07080] mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [groups, setGroups] = useState<TrialGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState('All')
  const [theme, setTheme] = useState('All')
  const [dateRange, setDateRange] = useState(0)
  const [tagFilter, setTagFilter] = useState('All')

  useEffect(() => {
    fetchTrialGroups(supabase).then((data) => {
      setGroups(data)
      setLoading(false)
    })
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    groups.forEach((g) => {
      g.tags.forEach((t) => tags.add(t))
      g.versions.forEach((v) => v.tags.forEach((t) => tags.add(t)))
    })
    return ['All', ...Array.from(tags)]
  }, [groups])

  const filtered = useMemo(() => {
    let result = groups

    if (platform !== 'All') {
      result = result.filter((g) => g.versions.some((v) => v.platform.includes(platform)))
    }
    if (theme !== 'All') {
      result = result.filter((g) => g.contentTheme.includes(theme))
    }
    if (tagFilter !== 'All') {
      result = result.filter((g) =>
        g.tags.includes(tagFilter) || g.versions.some((v) => v.tags.includes(tagFilter))
      )
    }
    if (dateRange > 0) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - dateRange)
      result = result.filter((g) => g.publishDate && new Date(g.publishDate) >= cutoff)
    }

    return result
  }, [groups, platform, theme, dateRange, tagFilter])

  const selectClass = "bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-2.5 py-1.5 text-xs text-[#45132c] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#45132c]">Analytics</h1>
        <p className="text-[#8a5a70] text-sm mt-1">Performance insights across all trial reels</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-[#e8d5c4] rounded-xl p-4 flex flex-wrap gap-3 shadow-[0_2px_8px_rgba(69,19,44,0.04)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#a07080] uppercase tracking-wider">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className={selectClass}
          >
            {['All', 'Instagram', 'TikTok', 'Facebook'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#a07080] uppercase tracking-wider">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={selectClass}
          >
            {['All', ...CONTENT_THEMES].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#a07080] uppercase tracking-wider">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className={selectClass}
          >
            {DATE_RANGES.map((d) => (
              <option key={d.days} value={d.days}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#a07080] uppercase tracking-wider">Tag</label>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className={selectClass}
          >
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <span className="text-xs text-[#a07080] pb-1.5">
            {filtered.length} trial{filtered.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={6} />)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard
              title="Completion Rate Trends"
              subtitle="Completion rate over time by publish date"
            >
              <CompletionTrendChart groups={filtered} />
            </SectionCard>

            <SectionCard
              title="Hook Type Performance"
              subtitle="Average views and saves by hook type"
            >
              <HookTypeChart groups={filtered} />
            </SectionCard>
          </div>

          <SectionCard
            title="Tag Performance Matrix"
            subtitle="How version tags compare against each other — which choices win trials?"
          >
            <TagPerformanceMatrix groups={filtered} />
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard
              title="Platform Comparison"
              subtitle="Average stats by platform"
            >
              <PlatformComparisonChart groups={filtered} />
            </SectionCard>

            <SectionCard
              title="Publish Day Performance"
              subtitle="Views vs day of week. Gold = winner versions."
            >
              <PublishDayChart groups={filtered} />
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  )
}
