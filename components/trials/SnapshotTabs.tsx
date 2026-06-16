'use client'

import { useState, useRef } from 'react'
import { Version, Snapshot, SnapshotPoint } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { calculateGroupScores, scoreColor } from '@/lib/scoring'
import { formatNumber } from '@/lib/utils'
import { versionColor, WINNER_COLOR } from '@/lib/version-colors'
import { Crown } from 'lucide-react'

const TABS: { takenAt: SnapshotPoint; label: string; isOptional?: boolean }[] = [
  { takenAt: '24h', label: '24h' },
  { takenAt: '3d', label: '3 days' },
  { takenAt: '7d', label: '7 days', isOptional: true },
]

const STAT_FIELDS: {
  key: keyof Omit<Snapshot, 'takenAt' | 'capturedDate' | 'successScore'>
  label: string
  isDecimal?: boolean
}[] = [
  { key: 'views', label: 'Views' },
  { key: 'accountsReached', label: 'Accounts Reached' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'shares', label: 'Shares' },
  { key: 'saves', label: 'Saves' },
  { key: 'profileVisits', label: 'Profile Visits' },
  { key: 'followersGained', label: 'Followers Gained' },
  { key: 'watchTimeSeconds', label: 'Watch Time (s)' },
  { key: 'completionRatePct', label: 'Completion Rate (%)', isDecimal: true },
]

function emptySnap(takenAt: SnapshotPoint): Snapshot {
  return {
    takenAt, capturedDate: '',
    views: 0, accountsReached: 0, likes: 0, comments: 0,
    shares: 0, saves: 0, profileVisits: 0, followersGained: 0,
    watchTimeSeconds: 0, completionRatePct: 0, successScore: null,
  }
}

type SnapState = Record<string, Record<SnapshotPoint, Snapshot>>

function initState(versions: Version[]): SnapState {
  const s: SnapState = {}
  for (const v of versions) {
    s[v.id] = {
      '24h': v.snapshots.find((x) => x.takenAt === '24h') ?? emptySnap('24h'),
      '3d': v.snapshots.find((x) => x.takenAt === '3d') ?? emptySnap('3d'),
      '7d': v.snapshots.find((x) => x.takenAt === '7d') ?? emptySnap('7d'),
    }
  }
  return s
}

interface SnapshotTabsProps {
  versions: Version[]
  onSnapshotsUpdated: (versionId: string, snapshots: Snapshot[]) => void
}

export default function SnapshotTabs({ versions, onSnapshotsUpdated }: SnapshotTabsProps) {
  const [activeTab, setActiveTab] = useState<SnapshotPoint>('24h')
  const [snaps, setSnaps] = useState<SnapState>(() => initState(versions))
  const snapsRef = useRef<SnapState>(snaps)
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const updateField = (
    versionId: string,
    field: keyof Snapshot,
    value: number | string,
    tab: SnapshotPoint,
  ) => {
    const next: SnapState = {
      ...snapsRef.current,
      [versionId]: {
        ...snapsRef.current[versionId],
        [tab]: { ...snapsRef.current[versionId][tab], [field]: value },
      },
    }
    snapsRef.current = next
    setSnaps(next)

    const key = `${versionId}:${tab}`
    if (debounceRefs.current[key]) clearTimeout(debounceRefs.current[key])
    debounceRefs.current[key] = setTimeout(async () => {
      const vSnaps = snapsRef.current[versionId]
      const toSave = (['24h', '3d', '7d'] as SnapshotPoint[])
        .map((pt) => vSnaps[pt])
        .filter((s) => s.views > 0 || s.capturedDate)

      const { error } = await supabase
        .from('versions')
        .update({ snapshots: toSave, updated_at: new Date().toISOString() })
        .eq('id', versionId)

      if (error) {
        toast.error('Failed to save snapshot')
      } else {
        onSnapshotsUpdated(versionId, toSave)
      }
    }, 800)
  }

  // Relative success scores for the active tab
  const scoreItems = versions.map((v) => ({
    snap: snaps[v.id]?.[activeTab] ?? emptySnap(activeTab),
    videoLengthSeconds: v.videoLengthSeconds,
  }))
  const scores = calculateGroupScores(scoreItems)

  const getBase24h = (versionId: string, field: keyof Snapshot): number =>
    (snaps[versionId]?.['24h']?.[field] as number) ?? 0

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 mb-4 bg-[#faf9f7] border border-[#e8d5c4] rounded-lg p-1 w-fit">
        {TABS.map(({ takenAt, label, isOptional }) => (
          <button
            key={takenAt}
            type="button"
            onClick={() => setActiveTab(takenAt)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === takenAt
                ? 'bg-white text-[#45132c] shadow-sm border border-[#e8d5c4]'
                : 'text-[#a07080] hover:text-[#5a2040]'
            }`}
          >
            {label}
            {isOptional && (
              <span className="ml-1.5 text-[10px] font-normal text-[#b09090]">nice to have</span>
            )}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="overflow-x-auto rounded-xl border border-[#f0e6d3]">
        {/* Version header row */}
        <div
          className="flex border-b-2 border-dashed border-[#f5a3c7]/60 bg-[#faf9f7]"
        >
          <div className="w-44 shrink-0 py-2 px-3" />
          {versions.map((v, idx) => {
            const color = versionColor(v.versionNumber)
            const score = scores[idx]
            return (
              <div
                key={v.id}
                className="flex-1 py-2 px-3 flex items-center gap-2"
                style={{ backgroundColor: v.isWinner ? '#fdf2f6' : undefined }}
              >
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold"
                  style={
                    v.isWinner
                      ? { backgroundColor: WINNER_COLOR, color: '#fff' }
                      : { backgroundColor: color + '14', color }
                  }
                >
                  {v.isWinner && (
                    <Crown size={10} fill="#ffd966" className="text-[#ffd966]" />
                  )}
                  V{v.versionNumber}
                </span>
                {score !== null && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: scoreColor(score) + '1f',
                      color: scoreColor(score),
                    }}
                    title="Success score — relative to other versions at this snapshot point"
                  >
                    {score}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Captured date row */}
        <div className="flex border-b border-[#f0e6d3]">
          <div className="w-44 shrink-0 py-2 px-3 text-xs text-[#8a5a70] font-medium bg-[#faf9f7] flex items-center">
            Date captured
          </div>
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex-1 py-2 px-3"
              style={{ backgroundColor: v.isWinner ? '#fdf2f6' : undefined }}
            >
              <input
                type="date"
                value={snaps[v.id]?.[activeTab]?.capturedDate ?? ''}
                onChange={(e) => updateField(v.id, 'capturedDate', e.target.value, activeTab)}
                className="w-full bg-transparent outline-none text-xs text-[#45132c] [color-scheme:light]"
              />
            </div>
          ))}
        </div>

        {/* Stat rows */}
        {STAT_FIELDS.map((sf) => (
          <div key={sf.key as string} className="flex border-b border-[#f0e6d3] last:border-0 hover:bg-[#faf9f7]/50 transition-colors group">
            <div className="w-44 shrink-0 py-2 px-3 text-xs text-[#8a5a70] font-medium bg-[#faf9f7] group-hover:bg-[#f5eee4] transition-colors flex items-center">
              {sf.label}
            </div>
            {versions.map((v) => {
              const val = (snaps[v.id]?.[activeTab]?.[sf.key] as number) ?? 0
              const has24hBaseline = (snaps[v.id]?.['24h']?.views ?? 0) > 0
              const base = activeTab !== '24h' && has24hBaseline ? getBase24h(v.id, sf.key) : null
              const delta = base !== null ? val - base : null

              return (
                <div
                  key={v.id}
                  className="flex-1 py-1.5 px-3"
                  style={{ backgroundColor: v.isWinner ? '#fdf2f6' : undefined }}
                >
                  <input
                    type="number"
                    value={val === 0 ? '' : val}
                    onChange={(e) =>
                      updateField(
                        v.id,
                        sf.key as keyof Snapshot,
                        parseFloat(e.target.value) || 0,
                        activeTab,
                      )
                    }
                    placeholder="0"
                    step={sf.isDecimal ? '0.01' : '1'}
                    className="w-full bg-transparent outline-none text-xs font-mono text-[#45132c] placeholder-[#d4b8c4] focus:text-[#ed4a7e] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {delta !== null && delta !== 0 && (
                    <span
                      className={`block text-[10px] font-medium leading-tight ${
                        delta > 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {delta > 0 ? '+' : ''}
                      {formatNumber(Math.abs(delta))} since 24h
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
