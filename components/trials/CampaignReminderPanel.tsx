'use client'

import { useState } from 'react'
import { X, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { TrialGroup } from '@/lib/types'
import { getCampaignReminders, CampaignReminder } from '@/lib/reminders'
import CampaignDataModal from './CampaignDataModal'

interface CampaignReminderPanelProps {
  groups: TrialGroup[]
  onGroupsChange: (groups: TrialGroup[]) => void
}

export default function CampaignReminderPanel({ groups, onGroupsChange }: CampaignReminderPanelProps) {
  const [filling, setFilling] = useState<CampaignReminder | null>(null)
  const reminders = getCampaignReminders(groups)

  if (reminders.length === 0) return null

  const handleDismiss = async (groupId: string) => {
    const { error } = await supabase
      .from('trial_groups')
      .update({ data_reminder_dismissed: true })
      .eq('id', groupId)
    if (error) { toast.error('Failed to dismiss reminder'); return }
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, dataReminderDismissed: true } : g))
    toast.success('Reminder dismissed')
  }

  const handleSaved = (updated: TrialGroup) => {
    onGroupsChange(groups.map((g) => g.id === updated.id ? updated : g))
    setFilling(null)
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-[#45132c] mb-3">Campaign Data Needed</h2>
      <div className="space-y-2">
        {reminders.map((r, i) => (
          <div
            key={r.group.id}
            className={`flex items-center justify-between gap-3 bg-white border-2 border-dashed border-[#ed4a7e]/40 rounded-xl px-4 py-3 animate-slideUp stagger-${Math.min(i + 1, 8)} hover-lift`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#ed4a7e]/10 rounded-full">
                <ClipboardList size={15} className="text-[#ed4a7e]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#45132c] truncate">{r.group.name}</p>
                <p className="text-xs text-[#8a5a70]">
                  Added {r.daysSinceCreated} days ago — add views, followers from reel and notes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFilling(r)}
                className="pressable px-3 py-1.5 bg-[#ed4a7e] hover:bg-[#45132c] text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Fill in data
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(r.group.id)}
                title="Dismiss reminder"
                className="text-[#c0a0b0] hover:text-[#45132c] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filling && (
        <CampaignDataModal
          group={filling.group}
          onClose={() => setFilling(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
