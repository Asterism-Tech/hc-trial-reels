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
          <h1 className="text-2xl font-bold text-white">Trials</h1>
          <p className="text-[#666] text-sm mt-1">Track and compare your A/B test Trial Reels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6B2D8B] hover:bg-[#7B3D9B] text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Trial Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 w-fit">
        {TABS.map((tab) => {
          const count = tab.value === 'all' ? groups.length : groups.filter((g) => g.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-[#6B2D8B] text-white'
                  : 'text-[#666] hover:text-white'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.value ? 'text-white/70' : 'text-[#444]'}`}>
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
                className="px-4 py-2 bg-[#6B2D8B] text-white text-sm rounded-xl hover:bg-[#7B3D9B] transition-colors"
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
