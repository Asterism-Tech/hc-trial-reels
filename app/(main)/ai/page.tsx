'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroups } from '@/lib/data'
import { TrialGroup } from '@/lib/types'
import InsightsPanel from '@/components/ai/InsightsPanel'
import ChatInterface from '@/components/ai/ChatInterface'
import SkeletonCard from '@/components/ui/SkeletonCard'

export default function AIPage() {
  const [groups, setGroups] = useState<TrialGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrialGroups(supabase).then((data) => {
      setGroups(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#45132c]">AI Insights</h1>
        <p className="text-[#8a5a70] text-sm mt-1">Auto-generated insights and conversational analysis</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={3} />)}
          </div>
          <div className="lg:col-span-3">
            <SkeletonCard lines={10} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Insights panel — 40% */}
          <div className="lg:col-span-2 overflow-y-auto">
            <h2 className="text-sm font-semibold text-[#45132c] mb-3">Generated Insights</h2>
            <InsightsPanel groups={groups} />
          </div>

          {/* Chat — 60% */}
          <div className="lg:col-span-3 flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
            <h2 className="text-sm font-semibold text-[#45132c] mb-3">Chat</h2>
            <div className="flex-1 min-h-0">
              <ChatInterface groups={groups} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
