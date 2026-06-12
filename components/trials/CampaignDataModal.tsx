'use client'

import { useState } from 'react'
import { X, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { TrialGroup } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { versionColor } from '@/lib/version-colors'

interface CampaignDataModalProps {
  group: TrialGroup
  onClose: () => void
  onSaved: (updatedGroup: TrialGroup) => void
}

interface VersionEntry {
  views: string
  followers: string
}

export default function CampaignDataModal({ group, onClose, onSaved }: CampaignDataModalProps) {
  const winner = group.versions.find((v) => v.isWinner)
  // Once a trial is won only the winner's data matters; while it's live,
  // every version needs its numbers.
  const editable = winner ? [winner] : group.versions

  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState<Record<string, VersionEntry>>(() =>
    Object.fromEntries(editable.map((v) => [v.id, {
      views: v.views ? String(v.views) : '',
      followers: v.followersGained ? String(v.followersGained) : '',
    }]))
  )
  const [notes, setNotes] = useState(group.notes || '')

  const updateEntry = (id: string, field: keyof VersionEntry, value: string) => {
    setEntries((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSave = async () => {
    setSaving(true)

    for (const v of editable) {
      const { error } = await supabase
        .from('versions')
        .update({
          views: parseInt(entries[v.id].views) || 0,
          followers_gained: parseInt(entries[v.id].followers) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', v.id)
      if (error) { setSaving(false); toast.error('Failed to save campaign data'); return }
    }

    const { error: gError } = await supabase
      .from('trial_groups')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', group.id)

    setSaving(false)
    if (gError) { toast.error('Failed to save campaign data'); return }
    toast.success('Campaign data saved 🎉')

    const updatedVersions = group.versions.map((v) =>
      entries[v.id]
        ? { ...v, views: parseInt(entries[v.id].views) || 0, followersGained: parseInt(entries[v.id].followers) || 0 }
        : v
    )
    onSaved({ ...group, notes, versions: updatedVersions })
  }

  const inputClass = "w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-scaleIn">
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e8d5c4] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-[#45132c]">Fill in Campaign Data</h2>
            <p className="text-xs text-[#a07080] mt-0.5 flex items-center gap-1 flex-wrap">
              {group.name}
              {winner
                ? <> · <Crown size={10} className="text-[#ed4a7e]" /> V{winner.versionNumber} published {formatDate(group.publishDate)}</>
                : <> · added {formatDate(group.createdAt)}</>}
            </p>
          </div>
          <button onClick={onClose} className="text-[#b09090] hover:text-[#45132c] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {editable.map((v) => {
            const color = versionColor(v.versionNumber)
            return (
              <div key={v.id} className="space-y-2">
                {editable.length > 1 && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                    style={{ backgroundColor: color + '14', color }}
                  >
                    V{v.versionNumber}
                  </span>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Views</label>
                    <input
                      type="number"
                      value={entries[v.id].views}
                      onChange={(e) => updateEntry(v.id, 'views', e.target.value)}
                      placeholder="e.g. 15400"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Followers from Reel</label>
                    <input
                      type="number"
                      value={entries[v.id].followers}
                      onChange={(e) => updateEntry(v.id, 'followers', e.target.value)}
                      placeholder="e.g. 120"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )
          })}

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

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e8d5c4] sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#8a5a70] hover:text-[#45132c] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="pressable px-5 py-2 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
          >
            {saving ? 'Saving...' : 'Save Data'}
          </button>
        </div>
      </div>
    </div>
  )
}
