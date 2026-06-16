'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import TagPicker from './TagPicker'
import { useRouter } from 'next/navigation'
import ModalPortal from '@/components/ui/ModalPortal'

const TEST_TYPES = [
  'Voiceover Test', 'Visual Opening', 'Music',
  'No Voiceover vs Voiceover', 'Caption',
]

const CONTENT_THEMES = ['Ideas/Projects/How to', 'Product', 'Trends']

const HOOK_TYPES = ['Visual Hook', 'Audio Hook']

interface VersionForm {
  hookType: string
  hookText: string
  videoLengthSeconds: string
  differences: string
  tags: string[]
}

const EMPTY_VERSION: VersionForm = { hookType: '', hookText: '', videoLengthSeconds: '', differences: '', tags: [] }

interface AddTrialModalProps {
  onClose: () => void
  onCreated: () => void
}

export default function AddTrialModal({ onClose, onCreated }: AddTrialModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [testType, setTestType] = useState(TEST_TYPES[0])
  const [contentTheme, setContentTheme] = useState<string[]>([])
  const [numVersions, setNumVersions] = useState(2)
  const [uploadDate, setUploadDate] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [versions, setVersions] = useState<VersionForm[]>([EMPTY_VERSION, EMPTY_VERSION])

  const updateVersions = (count: number) => {
    setNumVersions(count)
    setVersions((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill(EMPTY_VERSION)]
      }
      return prev.slice(0, count)
    })
  }

  const updateVersion = (i: number, field: keyof VersionForm, value: unknown) => {
    setVersions((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Group name is required'); return }
    setSubmitting(true)
    try {
      const { data: group, error: groupError } = await supabase
        .from('trial_groups')
        .insert({
          name: name.trim(),
          status: 'live',
          test_type: testType,
          content_theme: contentTheme,
          upload_date: uploadDate || null,
          // publish_date stays null until a winner is marked — winners are the published reels
          publish_date: null,
          tags,
          notes: '',
        })
        .select()
        .single()

      if (groupError) throw groupError

      const versionRows = versions.map((v, i) => ({
        trial_group_id: group.id,
        version_number: i + 1,
        total_versions: numVersions,
        is_winner: false,
        is_published: false,
        platform: ['Instagram'], // trials always run on Instagram
        secondary_platform: [],
        hook_type: v.hookType,
        hook_text: v.hookText,
        video_length_seconds: parseInt(v.videoLengthSeconds) || 0,
        differences: v.differences,
        face_on_camera: false,
        has_voiceover: false,
        audio_type: '',
        text_overlay: false,
        caption: '',
        cta_used: [],
        target_age_group: '',
        tags: v.tags,
        views: 0, accounts_reached: 0, likes: 0, comments: 0, shares: 0,
        saves: 0, profile_visits: 0, followers_gained: 0,
        watch_time_seconds: 0, completion_rate_pct: 0,
        team_comments: '', thumbnail_url: '',
      }))

      const { error: vError } = await supabase.from('versions').insert(versionRows)
      if (vError) throw vError

      toast.success('Trial group created!')
      onCreated()
      router.push(`/trials/${group.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create trial group')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5c4] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-[#45132c]">New Trial Group</h2>
            <p className="text-xs text-[#a07080] mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-[#b09090] hover:text-[#45132c] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Group Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Upcycled Mirror Ball Letter"
                  className="w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
                >
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

              <div>
                <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Number of Versions</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => numVersions > 2 && updateVersions(numVersions - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-[#f0e6d3] rounded-lg hover:bg-[#e8d5c4] transition-colors disabled:opacity-40"
                    disabled={numVersions <= 2}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-lg font-semibold w-6 text-center text-[#45132c]">{numVersions}</span>
                  <button
                    type="button"
                    onClick={() => numVersions < 5 && updateVersions(numVersions + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-[#f0e6d3] rounded-lg hover:bg-[#e8d5c4] transition-colors disabled:opacity-40"
                    disabled={numVersions >= 5}
                  >
                    <Plus size={14} />
                  </button>
                  <span className="text-xs text-[#a07080]">2–5 versions</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Upload Date</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all [color-scheme:light]"
                />
                <p className="text-[10px] text-[#a07080] mt-1">The publish date is set automatically when a version is marked as the winner.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a5a70] mb-1.5">Global Tags</label>
                <TagPicker selected={tags} onChange={setTags} />
                <p className="text-[10px] text-[#a07080] mt-1">Global tags apply to every version in this group. You&apos;ll add version-specific tags in the next step.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {versions.map((v, i) => (
                <div key={i} className="bg-[#faf9f7] border border-[#e8d5c4] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#45132c] mb-3">Version {i + 1}</h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#8a5a70] mb-1.5">Hook Type</label>
                        <select
                          value={v.hookType}
                          onChange={(e) => updateVersion(i, 'hookType', e.target.value)}
                          className="w-full bg-white border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
                        >
                          <option value="">Select...</option>
                          {HOOK_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#8a5a70] mb-1.5">Video Length (seconds)</label>
                        <input
                          type="number"
                          value={v.videoLengthSeconds}
                          onChange={(e) => updateVersion(i, 'videoLengthSeconds', e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full bg-white border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#8a5a70] mb-1.5">Hook Text</label>
                      <input
                        type="text"
                        value={v.hookText}
                        onChange={(e) => updateVersion(i, 'hookText', e.target.value)}
                        placeholder="Opening line or visual description..."
                        className="w-full bg-white border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#8a5a70] mb-1.5">What&apos;s Different</label>
                      <input
                        type="text"
                        value={v.differences}
                        onChange={(e) => updateVersion(i, 'differences', e.target.value)}
                        placeholder="Describe the variable being tested..."
                        className="w-full bg-white border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#8a5a70] mb-1.5">Version Tags</label>
                      <TagPicker selected={v.tags} onChange={(t) => updateVersion(i, 'tags', t)} />
                      <p className="text-[10px] text-[#a07080] mt-1">Tag what makes this version different — these tags are used to compare versions against each other.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8d5c4] sticky bottom-0 bg-white">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-4 py-2 text-sm text-[#8a5a70] hover:text-[#45132c] transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] pressable hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
          >
            {step === 1 ? 'Next →' : submitting ? 'Creating...' : 'Create Trial Group'}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
