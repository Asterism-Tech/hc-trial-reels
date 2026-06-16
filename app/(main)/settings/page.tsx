'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CustomTag, TagCategory } from '@/lib/types'
import { toast } from 'sonner'
import { PRESET_TAGS, categoryLabel } from '@/components/trials/TagPicker'

const TAG_CATEGORIES: TagCategory[] = ['test-type', 'audience', 'audio', 'hook-type', 'video-length', 'content-theme', 'format', 'custom']
const PRESET_COLORS = ['#3B82F6', '#F97316', '#EC4899', '#14B8A6', '#EAB308', '#6B7280', '#A855D4', '#22C55E', '#EF4444']

interface DeleteIntent {
  tagName: string
  isCustom: boolean
  customTagId?: string
  affectedGroupCount: number
}

export default function SettingsPage() {
  const [customTags, setCustomTags] = useState<CustomTag[]>([])
  const [loading, setLoading] = useState(true)
  const [newTag, setNewTag] = useState({ name: '', category: 'custom' as TagCategory, color: PRESET_COLORS[0] })
  const [adding, setAdding] = useState(false)
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const countAffectedGroups = async (tagName: string): Promise<number> => {
    const [{ data: groups }, { data: versions }] = await Promise.all([
      supabase.from('trial_groups').select('id, tags'),
      supabase.from('versions').select('trial_group_id, tags'),
    ])
    const groupIds = new Set<string>()
    for (const g of groups ?? []) {
      if ((g.tags as string[] | null)?.includes(tagName)) groupIds.add(g.id)
    }
    for (const v of versions ?? []) {
      if ((v.tags as string[] | null)?.includes(tagName)) groupIds.add(v.trial_group_id)
    }
    return groupIds.size
  }

  const initiateDelete = async (tagName: string, isCustom: boolean, customTagId?: string) => {
    const count = await countAffectedGroups(tagName)
    setDeleteIntent({ tagName, isCustom, customTagId, affectedGroupCount: count })
  }

  const confirmDelete = async () => {
    if (!deleteIntent) return
    setDeleting(true)

    try {
      // Strip tag from all trial_groups.tags
      const { data: affectedGroups } = await supabase.from('trial_groups').select('id, tags')
      for (const g of affectedGroups ?? []) {
        if ((g.tags as string[] | null)?.includes(deleteIntent.tagName)) {
          await supabase
            .from('trial_groups')
            .update({ tags: (g.tags as string[]).filter((t: string) => t !== deleteIntent.tagName) })
            .eq('id', g.id)
        }
      }

      // Strip tag from all versions.tags
      const { data: affectedVersions } = await supabase.from('versions').select('id, tags')
      for (const v of affectedVersions ?? []) {
        if ((v.tags as string[] | null)?.includes(deleteIntent.tagName)) {
          await supabase
            .from('versions')
            .update({ tags: (v.tags as string[]).filter((t: string) => t !== deleteIntent.tagName) })
            .eq('id', v.id)
        }
      }

      // Delete from custom_tags if it's a custom tag
      if (deleteIntent.isCustom && deleteIntent.customTagId) {
        await supabase.from('custom_tags').delete().eq('id', deleteIntent.customTagId)
        setCustomTags((prev) => prev.filter((t) => t.id !== deleteIntent.customTagId))
      }

      toast.success(`'${deleteIntent.tagName}' removed`)
      setDeleteIntent(null)
    } catch {
      toast.error('Failed to delete tag')
    } finally {
      setDeleting(false)
    }
  }

  const groupedPresets = PRESET_TAGS.reduce<Record<string, typeof PRESET_TAGS>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const inputClass = "w-full bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
  const sectionClass = "bg-white border border-[#e8d5c4] rounded-xl p-5 shadow-[0_2px_8px_rgba(69,19,44,0.06)]"

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#45132c]">Settings</h1>
        <p className="text-[#8a5a70] text-sm mt-1">Manage custom tags and integrations</p>
      </div>

      {/* Delete confirmation overlay */}
      {deleteIntent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteIntent(null)} />
          <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-sm p-6 shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-[#45132c]">Delete tag?</h3>
            </div>
            <p className="text-sm text-[#5a2040] mb-5">
              This will remove{' '}
              <span className="font-semibold">'{deleteIntent.tagName}'</span>
              {deleteIntent.affectedGroupCount > 0
                ? ` from ${deleteIntent.affectedGroupCount} trial group${deleteIntent.affectedGroupCount === 1 ? '' : 's'}.`
                : ' (not currently used by any trial groups).'}
              {!deleteIntent.isCustom && (
                <span className="block mt-1 text-[#a07080] text-xs">
                  This is a built-in preset tag — it will only be removed from existing trial groups, not from the preset list.
                </span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteIntent(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-[#8a5a70] hover:text-[#45132c] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Delete tag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Tags */}
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-[#45132c] mb-1">Custom Tags</h2>
        <p className="text-xs text-[#a07080] mb-4">Create custom tags to categorise your trial groups</p>

        {/* Add tag form */}
        <div className="bg-[#faf9f7] border border-[#e8d5c4] rounded-xl p-4 mb-4">
          <h3 className="text-xs font-medium text-[#8a5a70] mb-3">Add New Tag</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-32">
              <label className="block text-[10px] text-[#a07080] mb-1">Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag((p) => ({ ...p, name: e.target.value }))}
                placeholder="my-custom-tag"
                className={inputClass}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#a07080] mb-1">Category</label>
              <select
                value={newTag.category}
                onChange={(e) => setNewTag((p) => ({ ...p, category: e.target.value as TagCategory }))}
                className="bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-[#45132c] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all"
              >
                {TAG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryLabel(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#a07080] mb-1">Colour</label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTag((p) => ({ ...p, color: c }))}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newTag.color === c ? 'border-[#45132c] scale-110' : 'border-transparent'}`}
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
                className="flex items-center gap-1.5 px-3 py-2 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] pressable hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Custom tags list */}
        {loading ? (
          <p className="text-xs text-[#a07080]">Loading...</p>
        ) : customTags.length === 0 ? (
          <p className="text-xs text-[#a07080] text-center py-4">No custom tags yet. Add one above.</p>
        ) : (
          <div className="space-y-1.5">
            {customTags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 group">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-sm text-[#45132c]">{tag.name}</span>
                  <span className="text-xs text-[#a07080]">{categoryLabel(tag.category)}</span>
                </div>
                <button
                  onClick={() => initiateDelete(tag.name, true, tag.id)}
                  title="Delete tag"
                  className="text-[#dcc8b0] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Default Tag Presets */}
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-[#45132c] mb-1">Default Tag Presets</h2>
        <p className="text-xs text-[#a07080] mb-4">
          Built-in tags available to all trial groups. Deleting a preset removes it from any groups currently using it.
        </p>
        <div className="space-y-4">
          {Object.entries(groupedPresets).map(([category, tags]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-[#a07080] uppercase tracking-wider mb-2">
                {categoryLabel(category)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <div key={tag.name} className="group relative inline-flex items-center gap-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}
                    >
                      {tag.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => initiateDelete(tag.name, false)}
                      title="Remove from all trial groups"
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] items-center justify-center hidden group-hover:flex"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Automation */}
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-[#45132c] mb-1">Automate Stats Collection</h2>
        <p className="text-xs text-[#a07080] mb-4">
          Connect to social platforms to pull stats automatically instead of entering them manually.
        </p>

        <div className="space-y-3">
          <div className="bg-[#faf9f7] border border-[#e8d5c4] rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#45132c] mb-1">Instagram Graph API</h3>
                <p className="text-xs text-[#8a5a70] max-w-md">
                  Views, reach, likes, comments, shares, saves, profile visits, and completion rate are available
                  via the Instagram Graph API for Business/Creator accounts. Requires an approved Meta App.
                </p>
              </div>
              <div className="relative group shrink-0">
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#f0e6d3] text-[#a07080] text-xs font-medium rounded-lg cursor-not-allowed"
                >
                  Connect Instagram
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-[#e8d5c4] rounded-lg px-3 py-2 text-[10px] text-[#8a5a70] hidden group-hover:block shadow-[0_4px_12px_rgba(69,19,44,0.1)] z-10">
                  Coming soon — requires an Instagram Business API app approval
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#faf9f7] border border-[#e8d5c4] rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#45132c] mb-1">TikTok Research API</h3>
                <p className="text-xs text-[#8a5a70] max-w-md">
                  Similar stats available for TikTok Business accounts via the TikTok Research API.
                  Requires a TikTok developer account and app approval.
                </p>
              </div>
              <div className="relative group shrink-0">
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#f0e6d3] text-[#a07080] text-xs font-medium rounded-lg cursor-not-allowed"
                >
                  Connect TikTok
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-[#e8d5c4] rounded-lg px-3 py-2 text-[10px] text-[#8a5a70] hidden group-hover:block shadow-[0_4px_12px_rgba(69,19,44,0.1)] z-10">
                  Coming soon — requires a TikTok Business API app approval
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#faf9f7] border border-[#e8d5c4] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#45132c] mb-1">Scheduled Refresh</h3>
            <p className="text-xs text-[#8a5a70]">
              Once connected, stats will sync every 24 hours automatically via a Vercel cron job.
              No manual data entry required.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#b09090] mt-4">
          To enable live stat sync, an Instagram Business account and approved Graph API app are required.
          Contact your developer to set this up.
        </p>
      </section>
    </div>
  )
}
