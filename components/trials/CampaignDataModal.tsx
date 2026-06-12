'use client'

import { useState } from 'react'
import { X, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { TrialGroup, Version } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface CampaignDataModalProps {
  group: TrialGroup
  winner: Version
  onClose: () => void
  onSaved: (updatedGroup: TrialGroup) => void
}

export default function CampaignDataModal({ group, winner, onClose, onSaved }: CampaignDataModalProps) {
  const [saving, setSaving] = useState(false)
  const [views, setViews] = useState(winner.views ? String(winner.views) : '')
  const [followers, setFollowers] = useState(winner.followersGained ? String(winner.followersGained) : '')
  const [notes, setNotes] = useState(group.notes || '')

  const handleSave = async () => {
    setSaving(true)
    const viewsNum = parseInt(views) || 0
    const followersNum = parseInt(followers) || 0

    const { error: vError } = await supabase
      .from('versions')
      .update({
        views: viewsNum,
        followers_gained: followersNum,
        updated_at: new Date().toISOString(),
      })
      .eq('id', winner.id)

    const { error: gError } = await supabase
      .from('trial_groups')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', group.id)

    setSaving(false)
    if (vError || gError) { toast.error('Failed to save campaign data'); return }
    toast.success('Campaign data saved 🎉')

    const updatedVersions = group.versions.map((v) =>
      v.id === winner.id ? { ...v, views: viewsNum, followersGained: followersNum } : v
    )
    onSaved({ ...group, notes, versions: updatedVersions })
  }

  const inputClass = "w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-md shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-scaleIn">
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e8d5c4]">
          <div>
            <h2 className="text-base font-semibold text-[#45132c]">Fill in Campaign Data</h2>
            <p className="text-xs text-[#a07080] mt-0.5 flex items-center gap-1">
              {group.name} · <Crown size={10} className="text-[#ed4a7e]" /> V{winner.versionNumber} published {formatDate(group.publishDate)}
            </p>
          </div>
          <button onClick={onClose} className="text-[#b09090] hover:text-[#45132c] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Views</label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              placeholder="e.g. 15400"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Followers from Reel</label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="e.g. 120"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How did the campaign perform? Anything to remember next time?"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e8d5c4]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#8a5a70] hover:text-[#45132c] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] pressable hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
          >
            {saving ? 'Saving...' : 'Save Data'}
          </button>
        </div>
      </div>
    </div>
  )
}
