'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { FileSpreadsheet, FileText, Sparkles, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroups } from '@/lib/data'
import { TrialGroup } from '@/lib/types'
import { formatDate, formatNumber } from '@/lib/utils'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'
import Badge, { statusBadgeVariant } from '@/components/ui/Badge'
import { toast } from 'sonner'
import type { TrendAnalysis } from '@/lib/export'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// A reel belongs to the report period if it was published in it, falling
// back to its upload date for reels that have no winner yet.
function groupDate(g: TrialGroup): string {
  return g.publishDate || g.uploadDate || g.createdAt?.slice(0, 10) || ''
}

export default function ExportPage() {
  const [groups, setGroups] = useState<TrialGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(daysAgo(30))
  const [endDate, setEndDate] = useState(daysAgo(0))
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [includeAI, setIncludeAI] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  useEffect(() => {
    fetchTrialGroups(supabase).then((data) => {
      setGroups(data)
      setLoading(false)
    })
  }, [])

  const inRange = useMemo(() => {
    return groups.filter((g) => {
      const d = groupDate(g)
      return d && d >= startDate && d <= endDate
    })
  }, [groups, startDate, endDate])

  // Newly visible reels are selected by default
  useEffect(() => {
    setSelected(new Set(inRange.map((g) => g.id)))
  }, [inRange])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedGroups = inRange.filter((g) => selected.has(g.id))

  const fetchAnalysis = async (): Promise<TrendAnalysis | null> => {
    const res = await fetch('/api/trend-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trialData: selectedGroups, startDate, endDate }),
    })
    if (!res.ok) throw new Error('AI analysis failed')
    return res.json()
  }

  const handleExport = async (kind: 'excel' | 'pdf') => {
    if (selectedGroups.length === 0) { toast.error('Select at least one reel to export'); return }
    setExporting(kind)
    try {
      let analysis: TrendAnalysis | null = null
      if (includeAI) {
        toast.info('Generating AI trend analysis...')
        try {
          analysis = await fetchAnalysis()
        } catch {
          toast.error('AI analysis failed — exporting without it')
        }
      }
      const exporter = await import('@/lib/export')
      if (kind === 'excel') exporter.exportExcel({ groups: selectedGroups, startDate, endDate, analysis })
      else exporter.exportPdf({ groups: selectedGroups, startDate, endDate, analysis })
      toast.success(`${kind === 'excel' ? 'Excel' : 'PDF'} report downloaded`)
    } catch (err) {
      console.error(err)
      toast.error('Export failed')
    } finally {
      setExporting(null)
    }
  }

  const inputClass = "bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all [color-scheme:light]"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#45132c]">Export</h1>
        <p className="text-[#8a5a70] text-sm mt-1">Download Excel or PDF design reports for a period</p>
      </div>

      {/* Date range + options */}
      <div className="bg-white border border-[#e8d5c4] rounded-xl p-4 flex flex-wrap items-end gap-4 shadow-[0_2px_8px_rgba(69,19,44,0.04)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#a07080] uppercase tracking-wider">From</label>
          <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#a07080] uppercase tracking-wider">To</label>
          <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-1.5">
          {[{ label: '7 days', d: 7 }, { label: '30 days', d: 30 }, { label: '90 days', d: 90 }].map(({ label, d }) => (
            <button
              key={d}
              type="button"
              onClick={() => { setStartDate(daysAgo(d)); setEndDate(daysAgo(0)) }}
              className="pressable px-3 py-2 rounded-lg text-xs border border-[#e8d5c4] text-[#8a5a70] hover:border-[#45132c] hover:text-[#45132c] transition-all"
            >
              Last {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeAI}
            onChange={(e) => setIncludeAI(e.target.checked)}
            className="accent-[#ed4a7e] w-4 h-4"
          />
          <span className="flex items-center gap-1 text-sm text-[#45132c]">
            <Sparkles size={14} className="text-[#ed4a7e]" />
            Include AI trend analysis
          </span>
        </label>
      </div>

      {/* Reel selection */}
      <div className="bg-white border border-[#e8d5c4] rounded-xl shadow-[0_2px_8px_rgba(69,19,44,0.04)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8d5c4]">
          <h2 className="text-sm font-semibold text-[#45132c]">
            Reels in period <span className="text-[#a07080] font-normal">({selected.size} of {inRange.length} selected)</span>
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelected(new Set(inRange.map((g) => g.id)))}
              className="text-xs text-[#8a5a70] hover:text-[#45132c] transition-colors"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs text-[#8a5a70] hover:text-[#45132c] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : inRange.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No reels in this period" description="Try widening the date range" icon={<Download />} />
          </div>
        ) : (
          <div className="divide-y divide-[#f0e6d3]">
            {inRange.map((g) => {
              const winner = g.versions.find((v) => v.isWinner)
              return (
                <label key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f7] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.has(g.id)}
                    onChange={() => toggleSelect(g.id)}
                    className="accent-[#ed4a7e] w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#45132c] truncate">{g.name}</p>
                      <Badge variant={statusBadgeVariant(g.status)}>
                        {g.status === 'won' ? 'Published' : g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#a07080] mt-0.5">
                      {g.versions.length} versions · {formatDate(groupDate(g))}
                      {winner && ` · winner V${winner.versionNumber} (${formatNumber(winner.views)} views)`}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Export actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleExport('excel')}
          disabled={exporting !== null || selectedGroups.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] pressable hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
        >
          <FileSpreadsheet size={16} />
          {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
        </button>
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null || selectedGroups.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ed4a7e] hover:bg-[#45132c] text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] pressable hover:shadow-[0_4px_12px_rgba(69,19,44,0.2)]"
        >
          <FileText size={16} />
          {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
    </div>
  )
}
