'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Version } from '@/lib/types'
import TagPicker from './TagPicker'
import { versionColor } from '@/lib/version-colors'
import ModalPortal from '@/components/ui/ModalPortal'

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'YouTube Shorts']
const HOOK_TYPES = ['Visual', 'Audio', 'Text', 'Question']

interface EditVersionModalProps {
  version: Version
  onClose: () => void
  onSaved: (updated: Version) => void
}

export default function EditVersionModal({ version, onClose, onSaved }: EditVersionModalProps) {
  const [saving, setSaving] = useState(false)
  const [platform, setPlatform] = useState<string[]>(version.platform)
  const [hookType, setHookType] = useState(version.hookType)
  const [hookText, setHookText] = useState(version.hookText)
  const [videoLengthSeconds, setVideoLengthSeconds] = useState(String(version.videoLengthSeconds || ''))
  const [differences, setDifferences] = useState(version.differences)
  const [caption, setCaption] = useState(version.caption)
  const [tags, setTags] = useState<string[]>(version.tags)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('versions')
      .update({
        platform,
        hook_type: hookType,
        hook_text: hookText,
        video_length_seconds: parseInt(videoLengthSeconds) || 0,
        differences,
        caption,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', version.id)
    setSaving(false)
    if (error) { toast.error('Failed to save version'); return }
    toast.success(`V${version.versionNumber} updated`)
    onSaved({
      ...version,
      platform,
      hookType,
      hookText,
      videoLengthSeconds: parseInt(videoLengthSeconds) || 0,
      differences,
      caption,
      tags,
    })
  }

  const inputClass = "w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
  const color = versionColor(version.versionNumber)

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5c4] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ backgroundColor: color + '14', color }}
            >
              V{version.versionNumber}
            </span>
            <h2 className="text-lg font-semibold text-[#45132c]">Edit Reel Version</h2>
          </div>
          <button onClick={onClose} className="text-[#b09090] hover:text-[#45132c] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform((prev) =>
                    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                  )}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all duration-200 ${
                    platform.includes(p)
                      ? 'bg-[#45132c]/10 border-[#45132c]/30 text-[#45132c]'
                      : 'border-[#e8d5c4] text-[#8a5a70] hover:border-[#dcc8b0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Hook Type</label>
              <select value={hookType} onChange={(e) => setHookType(e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {HOOK_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Video Length (seconds)</label>
              <input
                type="number"
                value={videoLengthSeconds}
                onChange={(e) => setVideoLengthSeconds(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Hook Text</label>
            <input type="text" value={hookText} onChange={(e) => setHookText(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">What&apos;s Different</label>
            <input type="text" value={differences} onChange={(e) => setDifferences(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Caption</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Version Tags <span className="font-normal text-[#a07080]">(what makes this version different — used for comparison)</span></label>
            <TagPicker selected={tags} onChange={setTags} />
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
    </ModalPortal>
  )
}
