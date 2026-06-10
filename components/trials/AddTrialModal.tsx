'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import TagPicker from './TagPicker'
import { useRouter } from 'next/navigation'

const TEST_TYPES = [
  'Voiceover Test', 'Hook Test', 'Visual Opening',
  'Music Test', 'Pacing Test', 'Caption Test', 'Other',
]

const CONTENT_THEMES = [
  'Ideas/Projects/How to', 'Product', 'Behind the Scenes',
  'Tutorial', 'Trending', 'User Generated', 'Seasonal',
]

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'YouTube Shorts']
const HOOK_TYPES = ['Visual', 'Audio', 'Text', 'Question']

interface VersionForm {
  platform: string[]
  hookType: string
  hookText: string
  videoLengthSeconds: string
  differences: string
}

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
  const [publishDate, setPublishDate] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [versions, setVersions] = useState<VersionForm[]>([
    { platform: [], hookType: '', hookText: '', videoLengthSeconds: '', differences: '' },
    { platform: [], hookType: '', hookText: '', videoLengthSeconds: '', differences: '' },
  ])

  const updateVersions = (count: number) => {
    setNumVersions(count)
    setVersions((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ platform: [], hookType: '', hookText: '', videoLengthSeconds: '', differences: '' })]
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

  const togglePlatform = (i: number, platform: string) => {
    const current = versions[i].platform
    const next = current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform]
    updateVersion(i, 'platform', next)
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
          publish_date: publishDate || null,
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
        platform: v.platform,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">New Trial Group</h2>
            <p className="text-xs text-[#666] mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Group Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Upcycled Mirror Ball Letter"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#6B2D8B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6B2D8B]"
                >
                  {TEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Content Theme</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setContentTheme((prev) =>
                        prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
                      )}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        contentTheme.includes(theme)
                          ? 'bg-[#6B2D8B]/20 border-[#6B2D8B]/50 text-[#A855D4]'
                          : 'bg-transparent border-[#2A2A2A] text-[#666] hover:border-[#444]'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Number of Versions</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => numVersions > 2 && updateVersions(numVersions - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors disabled:opacity-40"
                    disabled={numVersions <= 2}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-lg font-semibold w-6 text-center">{numVersions}</span>
                  <button
                    type="button"
                    onClick={() => numVersions < 5 && updateVersions(numVersions + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors disabled:opacity-40"
                    disabled={numVersions >= 5}
                  >
                    <Plus size={14} />
                  </button>
                  <span className="text-xs text-[#555]">2–5 versions</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Upload Date</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6B2D8B] [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Publish Date</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6B2D8B] [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Tags</label>
                <TagPicker selected={tags} onChange={setTags} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {versions.map((v, i) => (
                <div key={i} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Version {i + 1}</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#666] mb-1.5">Platform</label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => togglePlatform(i, p)}
                            className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                              v.platform.includes(p)
                                ? 'bg-[#6B2D8B]/20 border-[#6B2D8B]/50 text-[#A855D4]'
                                : 'border-[#2A2A2A] text-[#666] hover:border-[#444]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#666] mb-1.5">Hook Type</label>
                        <select
                          value={v.hookType}
                          onChange={(e) => updateVersion(i, 'hookType', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6B2D8B]"
                        >
                          <option value="">Select...</option>
                          {HOOK_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#666] mb-1.5">Video Length (seconds)</label>
                        <input
                          type="number"
                          value={v.videoLengthSeconds}
                          onChange={(e) => updateVersion(i, 'videoLengthSeconds', e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#6B2D8B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#666] mb-1.5">Hook Text</label>
                      <input
                        type="text"
                        value={v.hookText}
                        onChange={(e) => updateVersion(i, 'hookText', e.target.value)}
                        placeholder="Opening line or visual description..."
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#6B2D8B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#666] mb-1.5">What&apos;s Different</label>
                      <input
                        type="text"
                        value={v.differences}
                        onChange={(e) => updateVersion(i, 'differences', e.target.value)}
                        placeholder="Describe the variable being tested..."
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#6B2D8B]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2A2A] sticky bottom-0 bg-[#1A1A1A]">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-[#6B2D8B] hover:bg-[#7B3D9B] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {step === 1 ? 'Next →' : submitting ? 'Creating...' : 'Create Trial Group'}
          </button>
        </div>
      </div>
    </div>
  )
}
