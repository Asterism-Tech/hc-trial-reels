'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp, Crown, Pencil, Trash2, Archive } from 'lucide-react'
import { TrialGroup, Version } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Badge, { statusBadgeVariant } from '@/components/ui/Badge'
import VersionChip from './VersionChip'
import VersionComparisonTable from './VersionComparisonTable'
import StatBar from './StatBar'
import EditTrialGroupModal from './EditTrialGroupModal'
import EditVersionModal from './EditVersionModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDate, isSafeImageUrl } from '@/lib/utils'
import { versionColor, WINNER_COLOR } from '@/lib/version-colors'

interface TrialGroupCardProps {
  group: TrialGroup
  onUpdate: (updated: TrialGroup) => void
  onDelete?: (groupId: string) => void
  defaultExpanded?: boolean
}

const STAT_FIELDS: { key: keyof Version; label: string; type: 'number' | 'pct' | 'text' | 'bool' | 'array' }[] = [
  { key: 'views', label: 'Views', type: 'number' },
  { key: 'accountsReached', label: 'Accounts Reached', type: 'number' },
  { key: 'likes', label: 'Likes', type: 'number' },
  { key: 'comments', label: 'Comments', type: 'number' },
  { key: 'shares', label: 'Shares', type: 'number' },
  { key: 'saves', label: 'Saves', type: 'number' },
  { key: 'profileVisits', label: 'Profile Visits', type: 'number' },
  { key: 'followersGained', label: 'Followers Gained', type: 'number' },
  { key: 'watchTimeSeconds', label: 'Watch Time (s)', type: 'number' },
  { key: 'completionRatePct', label: 'Completion Rate (%)', type: 'pct' },
]

function camelToSnake(s: string) {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase()
}

function InlineStatEdit({
  version,
  field,
  label,
  onSave,
}: {
  version: Version
  field: keyof Version
  label: string
  onSave: (versionId: string, field: string, value: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [localVal, setLocalVal] = useState(String(version[field] ?? 0))

  const handleChange = (val: string) => {
    setLocalVal(val)
    onSave(version.id, camelToSnake(field as string), parseFloat(val) || 0)
  }

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={localVal}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className="w-20 bg-[#faf9f7] border border-[#45132c] rounded px-1.5 py-0.5 text-xs text-[#45132c] focus:outline-none"
        step={field === 'completionRatePct' ? '0.01' : '1'}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xs text-[#45132c] hover:text-[#ed4a7e] transition-colors cursor-pointer font-mono"
      title="Click to edit"
    >
      {String(version[field] ?? '—')}
    </button>
  )
}

export default function TrialGroupCard({ group, onUpdate, onDelete, defaultExpanded = false }: TrialGroupCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [versions, setVersions] = useState<Version[]>(group.versions)
  const [editingGroup, setEditingGroup] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [editingVersion, setEditingVersion] = useState<Version | null>(null)
  const [deletingVersion, setDeletingVersion] = useState<Version | null>(null)
  const [busy, setBusy] = useState(false)
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const handleStatSave = useCallback((versionId: string, snakeField: string, value: number) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id !== versionId) return v
        const camelField = snakeField.replace(/_([a-z])/g, (_, l) => l.toUpperCase()) as keyof Version
        return { ...v, [camelField]: value }
      })
    )

    const key = `${versionId}:${snakeField}`
    if (debounceRefs.current[key]) clearTimeout(debounceRefs.current[key])
    debounceRefs.current[key] = setTimeout(async () => {
      const { error } = await supabase
        .from('versions')
        .update({ [snakeField]: value, updated_at: new Date().toISOString() })
        .eq('id', versionId)
      if (error) toast.error(`Failed to save ${snakeField}`)
    }, 800)
  }, [])

  // Winner = published reel. One action: the winner is published (publish date
  // set today if missing) and every other version is archived with the group
  // marked as won.
  const handleMarkWinner = async (versionId: string) => {
    const publishDate = group.publishDate || new Date().toISOString().slice(0, 10)

    for (const v of versions) {
      await supabase
        .from('versions')
        .update({ is_winner: v.id === versionId, is_published: v.id === versionId })
        .eq('id', v.id)
    }
    await supabase
      .from('trial_groups')
      .update({ status: 'won', publish_date: publishDate, updated_at: new Date().toISOString() })
      .eq('id', group.id)

    const updatedVersions = versions.map((v) => ({
      ...v,
      isWinner: v.id === versionId,
      isPublished: v.id === versionId,
    }))
    setVersions(updatedVersions)
    onUpdate({ ...group, status: 'won', publishDate, versions: updatedVersions })
    toast.success('Winner published — other versions archived 👑')
  }

  const handleDeleteGroup = async () => {
    setBusy(true)
    const { error } = await supabase.from('trial_groups').delete().eq('id', group.id)
    setBusy(false)
    if (error) { toast.error('Failed to delete reel group'); return }
    toast.success('Reel group deleted')
    setDeletingGroup(false)
    onDelete?.(group.id)
  }

  const handleDeleteVersion = async () => {
    if (!deletingVersion) return
    setBusy(true)
    const { error } = await supabase.from('versions').delete().eq('id', deletingVersion.id)
    if (error) { setBusy(false); toast.error('Failed to delete version'); return }

    const remaining = versions.filter((v) => v.id !== deletingVersion.id)
    await supabase
      .from('versions')
      .update({ total_versions: remaining.length })
      .eq('trial_group_id', group.id)

    // If the published winner was deleted, the trial goes back to live
    let status = group.status
    let publishDate = group.publishDate
    if (deletingVersion.isWinner && group.status === 'won') {
      status = 'live'
      publishDate = ''
      await supabase
        .from('trial_groups')
        .update({ status: 'live', publish_date: null, updated_at: new Date().toISOString() })
        .eq('id', group.id)
    }

    setBusy(false)
    const updated = remaining.map((v) => ({ ...v, totalVersions: remaining.length }))
    setVersions(updated)
    setDeletingVersion(null)
    onUpdate({ ...group, status, publishDate, versions: updated })
    toast.success(`V${deletingVersion.versionNumber} deleted`)
  }

  const handleVersionSaved = (updated: Version) => {
    const next = versions.map((v) => (v.id === updated.id ? updated : v))
    setVersions(next)
    setEditingVersion(null)
    onUpdate({ ...group, versions: next })
  }

  const handleTeamCommentSave = useCallback((versionId: string, comment: string) => {
    const key = `comment:${versionId}`
    if (debounceRefs.current[key]) clearTimeout(debounceRefs.current[key])
    debounceRefs.current[key] = setTimeout(async () => {
      const { error } = await supabase.from('versions').update({ team_comments: comment }).eq('id', versionId)
      if (error) toast.error('Failed to save comment')
      else toast.success('Comment saved')
    }, 800)
  }, [])

  return (
    <div className="bg-white border border-[#e8d5c4] rounded-xl overflow-hidden animate-fadeIn shadow-[0_2px_8px_rgba(69,19,44,0.06)] hover:shadow-[0_4px_16px_rgba(69,19,44,0.1)] transition-all duration-200">
      {/* Card Header */}
      <div
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-[#faf9f7] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-[#45132c] text-sm truncate">{group.name}</h3>
            <Badge variant={statusBadgeVariant(group.status)}>
              {group.status === 'won' ? 'Published' : group.status.charAt(0).toUpperCase() + group.status.slice(1)}
            </Badge>
            {group.testType && (
              <span className="text-xs px-2 py-0.5 bg-[#f0e6d3] text-[#8a5a70] rounded-full">{group.testType}</span>
            )}
          </div>
          {group.contentTheme.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {group.contentTheme.map((theme) => (
                <span key={theme} className="text-[10px] text-[#a07080] bg-[#f5eee4] px-2 py-0.5 rounded">{theme}</span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {versions.map((v) => (
              <VersionChip key={v.id} version={v} groupStatus={group.status} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#a07080]">Published</p>
            <p className="text-xs text-[#8a5a70]">{formatDate(group.publishDate)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Edit reel group"
              onClick={(e) => { e.stopPropagation(); setEditingGroup(true) }}
              className="p-1.5 text-[#b09090] hover:text-[#45132c] hover:bg-[#f5eee4] rounded-lg transition-all"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              title="Delete reel group"
              onClick={(e) => { e.stopPropagation(); setDeletingGroup(true) }}
              className="p-1.5 text-[#b09090] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {expanded ? <ChevronUp size={16} className="text-[#a07080]" /> : <ChevronDown size={16} className="text-[#a07080]" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[#e8d5c4] p-4 space-y-6">
          {/* Comparison table */}
          <div>
            <h4 className="text-xs font-semibold text-[#8a5a70] uppercase tracking-wider mb-3">Version Comparison</h4>
            <VersionComparisonTable versions={versions} />
          </div>

          {/* Stat bars */}
          {versions.some((v) => v.views > 0) && (
            <div>
              <h4 className="text-xs font-semibold text-[#8a5a70] uppercase tracking-wider mb-3">Performance</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBar versions={versions} stat="views" label="Views" />
                <StatBar versions={versions} stat="completionRatePct" label="Completion %" unit="%" />
                <StatBar versions={versions} stat="saves" label="Saves" />
                <StatBar versions={versions} stat="likes" label="Likes" />
              </div>
            </div>
          )}

          {/* Per-version panels */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(versions.length, 3)}, 1fr)` }}>
            {versions.map((v) => {
              const color = versionColor(v.versionNumber)
              const isArchived = !v.isWinner && (group.status === 'won' || group.status === 'archived')
              return (
                <div
                  key={v.id}
                  className="rounded-xl p-4 border-2"
                  style={v.isWinner
                    ? { borderColor: WINNER_COLOR, backgroundColor: '#fdf2f6', boxShadow: '0 2px 12px rgba(237,74,126,0.15)' }
                    : { borderColor: isArchived ? '#e0d8dc' : color + '55', backgroundColor: isArchived ? '#f7f4f5' : '#faf9f7' }}
                >
                  {/* Version header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-md"
                        style={v.isWinner
                          ? { backgroundColor: WINNER_COLOR, color: '#ffffff' }
                          : { color: isArchived ? '#9b8a92' : color }}
                      >
                        {v.isWinner && <Crown size={12} className="text-[#ffd966]" fill="#ffd966" />}
                        V{v.versionNumber}
                      </span>
                      {v.isWinner && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#ed4a7e]">Winner · Published</span>
                      )}
                      {isArchived && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#9b8a92]">
                          <Archive size={10} /> Archived
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!v.isWinner && (
                        <button
                          type="button"
                          onClick={() => handleMarkWinner(v.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-white text-[#a07080] border border-[#e8d5c4] hover:text-[#ed4a7e] hover:border-[#ed4a7e]/50 transition-all duration-200"
                          title="Mark as winner — publishes this version and archives the rest"
                        >
                          <Crown size={10} />
                          <span>Mark Winner</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingVersion(v)}
                        title="Edit version"
                        className="p-1.5 text-[#b09090] hover:text-[#45132c] bg-white border border-[#e8d5c4] rounded-lg transition-all"
                      >
                        <Pencil size={11} />
                      </button>
                      {versions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setDeletingVersion(v)}
                          title="Delete version"
                          className="p-1.5 text-[#b09090] hover:text-red-500 bg-white border border-[#e8d5c4] rounded-lg transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Version tags */}
                  {v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {v.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: color + '14', color: v.isWinner ? '#c02860' : color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Thumbnail */}
                  {v.thumbnailUrl && isSafeImageUrl(v.thumbnailUrl) && (
                    <img
                      src={v.thumbnailUrl}
                      alt={`V${v.versionNumber} thumbnail`}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                  )}

                  {/* Stats grid — editable */}
                  <div className="space-y-1.5 mb-3">
                    {STAT_FIELDS.map((sf) => (
                      <div key={sf.key} className="flex items-center justify-between">
                        <span className="text-[10px] text-[#a07080]">{sf.label}</span>
                        <InlineStatEdit
                          version={v}
                          field={sf.key}
                          label={sf.label}
                          onSave={handleStatSave}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Team comments */}
                  <div>
                    <p className="text-[10px] text-[#a07080] mb-1">Team Comments</p>
                    <TeamCommentArea
                      versionId={v.id}
                      initial={v.teamComments}
                      onSave={handleTeamCommentSave}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {editingGroup && (
        <EditTrialGroupModal
          group={{ ...group, versions }}
          onClose={() => setEditingGroup(false)}
          onSaved={(updated) => { setEditingGroup(false); onUpdate(updated) }}
        />
      )}

      {editingVersion && (
        <EditVersionModal
          version={editingVersion}
          onClose={() => setEditingVersion(null)}
          onSaved={handleVersionSaved}
        />
      )}

      {deletingGroup && (
        <ConfirmDialog
          title="Delete reel group?"
          message={`"${group.name}" and all ${versions.length} of its versions will be permanently deleted.`}
          onConfirm={handleDeleteGroup}
          onCancel={() => setDeletingGroup(false)}
          busy={busy}
        />
      )}

      {deletingVersion && (
        <ConfirmDialog
          title={`Delete V${deletingVersion.versionNumber}?`}
          message={deletingVersion.isWinner
            ? 'This is the published winner — deleting it will put the trial back to live.'
            : 'This version and its stats will be permanently deleted.'}
          onConfirm={handleDeleteVersion}
          onCancel={() => setDeletingVersion(null)}
          busy={busy}
        />
      )}
    </div>
  )
}

function TeamCommentArea({
  versionId,
  initial,
  onSave,
}: {
  versionId: string
  initial: string
  onSave: (id: string, val: string) => void
}) {
  const [val, setVal] = useState(initial)
  return (
    <textarea
      value={val}
      onChange={(e) => {
        setVal(e.target.value)
        onSave(versionId, e.target.value)
      }}
      rows={2}
      placeholder="Add team notes..."
      className="w-full bg-white border border-[#e8d5c4] rounded-lg px-2 py-1.5 text-xs text-[#5a2040] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all resize-none"
    />
  )
}
