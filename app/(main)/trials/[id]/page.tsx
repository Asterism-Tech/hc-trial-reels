'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroup } from '@/lib/data'
import { TrialGroup } from '@/lib/types'
import TrialGroupCard from '@/components/trials/TrialGroupCard'
import ViewsByVersionChart from '@/components/analytics/ViewsByVersionChart'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'

export default function TrialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [group, setGroup] = useState<TrialGroup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrialGroup(supabase, id)
      setGroup(data)
      setLoading(false)
    }
    load()
  }, [id])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/trials" className="text-[#a07080] hover:text-[#45132c] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#45132c]">{group?.name ?? 'Trial Group'}</h1>
          <p className="text-[#8a5a70] text-xs mt-0.5">Trial Reel detail view</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCard lines={8} />
      ) : group ? (
        <>
          <TrialGroupCard
            group={group}
            onUpdate={(updated) => setGroup(updated)}
            onDelete={() => router.push('/trials')}
            defaultExpanded
          />
          {group.versions.some((v) => v.views > 0) && (
            <div className="bg-white border border-[#e8d5c4] rounded-xl p-5 shadow-[0_2px_8px_rgba(69,19,44,0.06)]">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#45132c]">Views by Version</h3>
                <p className="text-xs text-[#a07080] mt-0.5">How each version of this reel performed. Pink = winner.</p>
              </div>
              <ViewsByVersionChart groups={[group]} />
            </div>
          )}
        </>
      ) : (
        <EmptyState title="Trial group not found" description="This trial may have been deleted." />
      )}
    </div>
  )
}
