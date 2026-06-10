'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CustomTag, TagCategory } from '@/lib/types'
import { toast } from 'sonner'
import { PRESET_TAGS, CATEGORY_LABELS } from '@/components/trials/TagPicker'

const TAG_CATEGORIES: TagCategory[] = ['duration', 'content-style', 'audio', 'audience', 'hook-type', 'custom']
const PRESET_COLORS = ['#3B82F6', '#F97316', '#EC4899', '#14B8A6', '#EAB308', '#6B7280', '#A855D4', '#22C55E', '#EF4444']

export default function SettingsPage() {
  const [customTags, setCustomTags] = useState<CustomTag[]>([])
  const [loading, setLoading] = useState(true)
  const [newTag, setNewTag] = useState({ name: '', category: 'custom' as TagCategory, color: PRESET_COLORS[0] })
  const [adding, setAdding] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadTags = async () => {
    const { data } = await supabase.from('custom_tags').select('*').order('created_at', { ascending: false })
    if (data) {
      setCustomTags(data.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category as TagCategory,
        color: t.color || '#6B7280',
      })))
    }
    setLoading(false)
  }

  useEffect(() => { loadTags() }, [])

  const handleAddTag = async () => {
    if (!newTag.name.trim()) { toast.error('Tag name is required'); return }
    setAdding(true)
    const { error } = await supabase.from('custom_tags').insert({
      name: newTag.name.trim().toLowerCase().replace(/\s+/g, '-'),
      category: newTag.category,
      color: newTag.color,
    })
    if (error) {
      toast.error(error.message.includes('unique') ? 'Tag already exists' : 'Failed to add tag')
    } else {
      toast.success('Tag added')
      setNewTag({ name: '', category: 'custom', color: PRESET_COLORS[0] })
      await loadTags()
    }
    setAdding(false)
  }

  const handleDeleteTag = async (id: string) => {
    const { error } = await supabase.from('custom_tags').delete().eq('id', id)
    if (error) { toast.error('Failed to delete tag'); return }
    toast.success('Tag deleted')
    setCustomTags((prev) => prev.filter((t) => t.id !== id))
    setDeleteConfirm(null)
  }

  const groupedPresets = PRESET_TAGS.reduce<Record<string, typeof PRESET_TAGS>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#666] text-sm mt-1">Manage custom tags and integrations</p>
      </div>

      {/* Custom Tags */}
      <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-1">Custom Tags</h2>
        <p className="text-xs text-[#555] mb-4">Create custom tags to categorise your trial groups</p>

        {/* Add tag form */}
        <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4 mb-4">
          <h3 className="text-xs font-medium text-[#888] mb-3">Add New Tag</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-32">
              <label className="block text-[10px] text-[#555] mb-1">Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag((p) => ({ ...p, name: e.target.value }))}
                placeholder="my-custom-tag"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#6B2D8B]"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#555] mb-1">Category</label>
              <select
                value={newTag.category}
                onChange={(e) => setNewTag((p) => ({ ...p, category: e.target.value as TagCategory }))}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6B2D8B]"
              >
                {TAG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#555] mb-1">Colour</label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTag((p) => ({ ...p, color: c }))}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newTag.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddTag}
                disabled={adding}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#6B2D8B] hover:bg-[#7B3D9B] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Custom tags list */}
        {loading ? (
          <p className="text-xs text-[#555]">Loading...</p>
        ) : customTags.length === 0 ? (
          <p className="text-xs text-[#555] text-center py-4">No custom tags yet. Add one above.</p>
        ) : (
          <div className="space-y-1.5">
            {customTags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-sm text-white">{tag.name}</span>
                  <span className="text-xs text-[#555]">{CATEGORY_LABELS[tag.category]}</span>
                </div>
                {deleteConfirm === tag.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteTag(tag.id)} className="text-xs text-red-400 hover:text-red-300">Confirm</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs text-[#555] hover:text-white">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(tag.id)}
                    className="text-[#444] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Default Tag Presets */}
      <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-1">Default Tag Presets</h2>
        <p className="text-xs text-[#555] mb-4">Built-in tags available to all trial groups (read-only)</p>
        <div className="space-y-4">
          {Object.entries(groupedPresets).map(([category, tags]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category as TagCategory]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Automation */}
      <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-1">Automate Stats Collection</h2>
        <p className="text-xs text-[#555] mb-4">
          Connect to social platforms to pull stats automatically instead of entering them manually.
        </p>

        <div className="space-y-3">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Instagram Graph API</h3>
                <p className="text-xs text-[#666] max-w-md">
                  Views, reach, likes, comments, shares, saves, profile visits, and completion rate are available
                  via the Instagram Graph API for Business/Creator accounts. Requires an approved Meta App.
                </p>
              </div>
              <div className="relative group shrink-0">
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#2A2A2A] text-[#555] text-xs font-medium rounded-lg cursor-not-allowed"
                >
                  Connect Instagram
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[10px] text-[#888] hidden group-hover:block shadow-xl z-10">
                  Coming soon — requires an Instagram Business API app approval
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">TikTok Research API</h3>
                <p className="text-xs text-[#666] max-w-md">
                  Similar stats available for TikTok Business accounts via the TikTok Research API.
                  Requires a TikTok developer account and app approval.
                </p>
              </div>
              <div className="relative group shrink-0">
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#2A2A2A] text-[#555] text-xs font-medium rounded-lg cursor-not-allowed"
                >
                  Connect TikTok
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[10px] text-[#888] hidden group-hover:block shadow-xl z-10">
                  Coming soon — requires a TikTok Business API app approval
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-1">Scheduled Refresh</h3>
            <p className="text-xs text-[#666]">
              Once connected, stats will sync every 24 hours automatically via a Vercel cron job.
              No manual data entry required.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#444] mt-4">
          To enable live stat sync, an Instagram Business account and approved Graph API app are required.
          Contact your developer to set this up.
        </p>
      </section>
    </div>
  )
}
