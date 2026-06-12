'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { TrialGroup } from '@/lib/types'
import TagPicker from './TagPicker'

const TEST_TYPES = [
  'Voiceover Test', 'Hook Test', 'Visual Opening',
  'Music Test', 'Pacing Test', 'Caption Test', 'Other',
]

const CONTENT_THEMES = [
  'Ideas/Projects/How to', 'Product', 'Behind the Scenes',
  'Tutorial', 'Trending', 'User Generated', 'Seasonal',
]

interface EditTrialGroupModalProps {
  group: TrialGroup
  onClose: () => void
  onSaved: (updated: TrialGroup) => void
}

export default function EditTrialGroupModal({ group, onClose, onSaved }: EditTrialGroupModalProps) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(group.name)
  const [testType, setTestType] = useState(group.testType || TEST_TYPES[0])
  const [contentTheme, setContentTheme] = useState<string[]>(group.contentTheme)
  const [uploadDate, setUploadDate] = useState(group.uploadDate || '')
  const [publishDate, setPublishDate] = useState(group.publishDate || '')
  const [tags, setTags] = useState<string[]>(group.tags)
  const [notes, setNotes] = useState(group.notes || '')

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Group name is required'); return }
    setSaving(true)
    const { error } = await supabase
      .from('trial_groups')
      .update({
        name: name.trim(),
        test_type: testType,
        content_theme: contentTheme,
        upload_date: uploadDate || null,
        publish_date: publishDate || null,
        tags,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', group.id)
    setSaving(false)
    if (error) { toast.error('Failed to save changes'); return }
    toast.success('Reel group updated')
    onSaved({ ...group, name: name.trim(), testType, contentTheme, uploadDate, publishDate, tags, notes })
  }

  const inputClass = "w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5c4] sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-[#45132c]">Edit Reel Group</h2>
          <button onClick={onClose} className="text-[#b09090] hover:text-[#45132c] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Group Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Test Type</label>
            <select value={testType} onChange={(e) => setTestType(e.target.value)} className={inputClass}>
              {TEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Content Theme</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setContentTheme((prev) =>
                    prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
                  )}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 ${
                    contentTheme.includes(theme)
                      ? 'bg-[#45132c]/10 border-[#45132c]/30 text-[#45132c]'
                      : 'bg-transparent border-[#e8d5c4] text-[#8a5a70] hover:border-[#dcc8b0]'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Upload Date</label>
              <input type="date" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Publish Date</label>
              <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
              <p className="text-[10px] text-[#a07080] mt-1">
                Set automatically when a winner is marked — adjust here if needed
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Global Tags <span className="font-normal text-[#a07080]">(apply to all versions)</span></label>
            <TagPicker selected={tags} onChange={setTags} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes about this reel group..."
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
            className="px-5 py-2 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] pressable hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
