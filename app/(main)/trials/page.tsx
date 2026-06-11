'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroups } from '@/lib/data'
import { TrialGroup, TrialStatus } from '@/lib/types'
import TrialGroupCard from '@/components/trials/TrialGroupCard'
import AddTrialModal from '@/components/trials/AddTrialModal'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'
import { Film } from 'lucide-react'

const TABS: { label: string; value: TrialStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Winning', value: 'won' },
  { label: 'Archived', value: 'archived' },
]

export default function TrialsPage() {
  const [groups, setGroups] = useState<TrialGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TrialStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await fetchTrialGroups(supabase)
    setGroups(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = activeTab === 'all' ? groups : groups.filter((g) => g.status === activeTab)

  const handleUpdate = (updated: TrialGroup) => {
    setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g))
  }

  const EMPTY_MESSAGES: Record<string, string> = {
    all: 'No trial groups yet — create your first one!',
    live: 'No live trials — add a new trial group above',
    won: 'No winning trials yet — keep testing!',
    archived: 'No archived trials',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#45132c]">Trials</h1>
          <p className="text-[#8a5a70] text-sm mt-1">Track and compare your A/B test Trial Reels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
        >
          <Plus size={16} />
          New Trial Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e8d5c4] rounded-xl p-1 w-fit shadow-[0_2px_8px_rgba(69,19,44,0.04)]">
        {TABS.map((tab) => {
          const count = tab.value === 'all' ? groups.length : groups.filter((g) => g.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-[#45132c] text-white'
                  : 'text-[#8a5a70] hover:text-[#45132c]'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.value ? 'text-white/70' : 'text-[#b09090]'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Trial list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={EMPTY_MESSAGES[activeTab]}
          icon={<Film />}
          action={
            activeTab === 'all' || activeTab === 'live' ? (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-[#45132c] text-white text-sm font-semibold rounded-xl hover:bg-[#ed4a7e] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
              >
                Add Trial Group
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <TrialGroupCard key={g.id} group={g} onUpdate={handleUpdate} />
          ))}
        </div>
      )}

      {showModal && (
        <AddTrialModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
