'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchTrialGroups } from '@/lib/data'
import { TrialGroup } from '@/lib/types'
import { getCampaignReminders, CampaignReminder } from '@/lib/reminders'
import CampaignDataModal from '@/components/trials/CampaignDataModal'
import { toast } from 'sonner'

export default function NotificationsBell() {
  const [groups, setGroups] = useState<TrialGroup[]>([])
  const [open, setOpen] = useState(false)
  const [filling, setFilling] = useState<CampaignReminder | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTrialGroups(supabase).then(setGroups)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const reminders = getCampaignReminders(groups)

  const handleDismiss = async (groupId: string) => {
    const { error } = await supabase
      .from('trial_groups')
      .update({ data_reminder_dismissed: true })
      .eq('id', groupId)
    if (error) { toast.error('Failed to dismiss reminder'); return }
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, dataReminderDismissed: true } : g))
  }

  const handleSaved = (updated: TrialGroup) => {
    setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g))
    setFilling(null)
  }

  return (
    <div ref={panelRef} className="relative z-40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Notifications"
        className="pressable relative w-10 h-10 flex items-center justify-center bg-white border border-[#e8d5c4] rounded-full shadow-[0_2px_8px_rgba(69,19,44,0.08)] text-[#8a5a70] hover:text-[#45132c] hover:border-[#45132c]/30 hover:scale-105 transition-all duration-200"
      >
        <Bell size={17} className={reminders.length > 0 ? 'animate-bellSwing origin-top' : ''} />
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#ed4a7e] text-white text-[10px] font-bold rounded-full animate-popIn">
            {reminders.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-[#e8d5c4] rounded-xl shadow-[0_8px_24px_rgba(69,19,44,0.15)] overflow-hidden animate-scaleIn origin-top-right">
          <div className="px-4 py-3 border-b border-[#e8d5c4]">
            <h3 className="text-sm font-semibold text-[#45132c]">Notifications</h3>
          </div>
          {reminders.length === 0 ? (
            <p className="px-4 py-6 text-xs text-[#a07080] text-center">You&apos;re all caught up 🎉</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {reminders.map((r) => (
                <div key={r.group.id} className="px-4 py-3 border-b border-[#f0e6d3] last:border-0 hover:bg-[#faf9f7] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <ClipboardList size={14} className="text-[#ed4a7e] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#45132c] truncate">{r.group.name}</p>
                        <p className="text-[11px] text-[#8a5a70] mt-0.5">
                          Published {r.daysSincePublish} days ago — fill in views, followers from reel and notes
                        </p>
                        <button
                          type="button"
                          onClick={() => { setFilling(r); setOpen(false) }}
                          className="mt-1.5 text-[11px] font-semibold text-[#ed4a7e] hover:text-[#45132c] transition-colors"
                        >
                          Fill in campaign data →
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismiss(r.group.id)}
                      title="Dismiss reminder"
                      className="text-[#c0a0b0] hover:text-[#45132c] transition-colors shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filling && (
        <CampaignDataModal
          group={filling.group}
          winner={filling.winner}
          onClose={() => setFilling(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
