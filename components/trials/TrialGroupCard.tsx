'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp, Crown, Pencil, Trash2, Archive, Plus, X } from 'lucide-react'
import { TrialGroup, Version, Snapshot, WorkflowStage } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Badge, { statusBadgeVariant } from '@/components/ui/Badge'
import VersionChip from './VersionChip'
import VersionComparisonTable from './VersionComparisonTable'
import StatBar from './StatBar'
import SnapshotTabs from './SnapshotTabs'
import EditTrialGroupModal from './EditTrialGroupModal'
import EditVersionModal from './EditVersionModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDate, isSafeImageUrl } from '@/lib/utils'
import { versionColor, WINNER_COLOR } from '@/lib/version-colors'
import { calculateGroupScores, scoreColor } from '@/lib/scoring'
import { computeWorkflowStage } from '@/lib/data'

const SECONDARY_PLATFORMS = ['TikTok', 'Facebook', 'YouTube Shorts']

interface TrialGroupCardProps {
  group: TrialGroup
  onUpdate: (updated: TrialGroup) => void
  onDelete?: (groupId: string) => void
  defaultExpanded?: boolean
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function is24hWindowPassed(publishDate: string): boolean {
  if (!publishDate) return false
  const pub = new Date(publishDate)
  const now = new Date()
  const diffMs = now.getTime() - pub.getTime()
  return diffMs >= 24 * 60 * 60 * 1000
}

export default function TrialGroupCard({ group, onUpdate, onDelete, defaultExpanded = false }: TrialGroupCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [versions, setVersions] = useState<Version[]>(group.versions)
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>(group.workflowStage)
  const [editingGroup, setEditingGroup] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [editingVersion, setEditingVersion] = useState<Version | null>(null)
  const [deletingVersion, setDeletingVersion] = useState<Version | null>(null)
  const [editingSecondaryPlatform, setEditingSecondaryPlatform] = useState<Set<string>>(new Set())
  const [secondaryPlatformDraft, setSecondaryPlatformDraft] = useState<Record<string, { platform: string; date: string }>>({})
  const [busy, setBusy] = useState(false)
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const updateVersions = (next: Version[]) => {
    const newStage = computeWorkflowStage(group.publishDate || null, next)
    setVersions(next)
    setWorkflowStage(newStage)
    onUpdate({ ...group, workflowStage: newStage, versions: next })
  }

  const handleSnapshotsUpdated = useCallback((versionId: string, snapshots: Snapshot[]) => {
    setVersions((prev) => {
      const next = prev.map((v) => {
        if (v.id !== versionId) return v
        const snap24h = snapshots.find((s) => s.takenAt === '24h')
        return {
          ...v,
          snapshots,
          ...(snap24h
            ? {
                views: snap24h.views,
                accountsReached: snap24h.accountsReached,
                likes: snap24h.likes,
                comments: snap24h.comments,
                shares: snap24h.shares,
                saves: snap24h.saves,
                profileVisits: snap24h.profileVisits,
                followersGained: snap24h.followersGained,
                watchTimeSeconds: snap24h.watchTimeSeconds,
                completionRatePct: snap24h.completionRatePct,
              }
            : {}),
        }
      })
      const newStage = computeWorkflowStage(group.publishDate || null, next)
      setWorkflowStage(newStage)
      onUpdate({ ...group, workflowStage: newStage, versions: next })
      return next
    })
  }, [group, onUpdate])

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

    const next = versions.map((v) => ({
      ...v,
      isWinner: v.id === versionId,
      isPublished: v.id === versionId,
    }))
    setVersions(next)
    const newStage = computeWorkflowStage(publishDate, next)
    setWorkflowStage(newStage)
    onUpdate({ ...group, status: 'won', publishDate, workflowStage: newStage, versions: next })
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
    const newStage = computeWorkflowStage(publishDate || null, updated)
    setWorkflowStage(newStage)
    onUpdate({ ...group, status, publishDate, workflowStage: newStage, versions: updated })
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
    }, 800)
  }, [])

  const handleSaveSecondaryPlatform = async (versionId: string) => {
    const draft = secondaryPlatformDraft[versionId]
    if (!draft?.platform) { toast.error('Choose a platform'); return }

    const { error } = await supabase
      .from('versions')
      .update({
        secondary_platform: [draft.platform],
        secondary_platform_date: draft.date || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', versionId)

    if (error) { toast.error('Failed to save'); return }

    const next = versions.map((v) =>
      v.id === versionId
        ? { ...v, secondaryPlatform: [draft.platform], secondaryPlatformDate: draft.date || null }
        : v
    )
    setVersions(next)
    setEditingSecondaryPlatform((prev) => { const s = new Set(prev); s.delete(versionId); return s })
    toast.success('Cross-post recorded')
    onUpdate({ ...group, versions: next })
  }

  // Relative success scores at 24h for all versions
  const score24hItems = versions.map((v) => ({
    snap: v.snapshots.find((s) => s.takenAt === '24h') ?? {
      takenAt: '24h' as const,
      capturedDate: '', views: v.views, accountsReached: v.accountsReached,
      likes: v.likes, comments: v.comments, shares: v.shares, saves: v.saves,
      profileVisits: v.profileVisits, followersGained: v.followersGained,
      watchTimeSeconds: v.watchTimeSeconds, completionRatePct: v.completionRatePct,
      successScore: null,
    },
    videoLengthSeconds: v.videoLengthSeconds,
  }))
  const score24hValues = calculateGroupScores(score24hItems)
  const scoreByVersionId = Object.fromEntries(versions.map((v, i) => [v.id, score24hValues[i]]))

  const hasAny24hData = versions.some((v) => v.views > 0 || v.snapshots.some((s) => s.takenAt === '24h' && s.views > 0))
  const showWorkflowBanner =
    workflowStage === 'awaiting_24h' &&
    group.publishDate &&
    is24hWindowPassed(group.publishDate)

  return (
    <div className={`bg-white border border-[#e8d5c4] rounded-xl overflow-hidden animate-fadeIn shadow-[0_2px_8px_rgba(69,19,44,0.06)] transition-all duration-200 ${expanded ? 'shadow-[0_8px_24px_rgba(69,19,44,0.12)]' : 'hover-lift'}`}>
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
            {/* Snapshot reminder pills */}
            {workflowStage === 'awaiting_3d' && group.publishDate && (
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                3-day snapshot due {addDays(group.publishDate, 3)}
              </span>
            )}
            {workflowStage === 'awaiting_7d' && group.publishDate && (
              <span className="text-[10px] px-2 py-0.5 bg-[#faf9f7] text-[#a07080] border border-[#e8d5c4] rounded-full">
                7-day snapshot due {addDays(group.publishDate, 7)} <span className="opacity-60">· nice to have</span>
              </span>
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

      {/* 24h data-due banner */}
      {showWorkflowBanner && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 flex items-center gap-2">
          <span className="text-sm">⏱</span>
          <p className="text-xs text-amber-800 font-medium">
            Ready for 24h data — enter stats below and choose your winner.
          </p>
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="ml-auto text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              Open
            </button>
          )}
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[#e8d5c4] p-4 space-y-6 animate-slideUp">
          {/* Comparison table */}
          <div>
            <h4 className="text-xs font-semibold text-[#8a5a70] uppercase tracking-wider mb-3">Version Comparison</h4>
            <VersionComparisonTable versions={versions} />
          </div>

          {/* Snapshot tabs — main stat input */}
          <div>
            <h4 className="text-xs font-semibold text-[#8a5a70] uppercase tracking-wider mb-3">Snapshot Data</h4>
            <SnapshotTabs versions={versions} onSnapshotsUpdated={handleSnapshotsUpdated} />
          </div>

          {/* Stat bars */}
          {hasAny24hData && (
            <div className="animate-slideUp stagger-2">
              <h4 className="text-xs font-semibold text-[#8a5a70] uppercase tracking-wider mb-3">24h Performance</h4>
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
            {versions.map((v, vIdx) => {
              const color = versionColor(v.versionNumber)
              const isArchived = !v.isWinner && (group.status === 'won' || group.status === 'archived')
              const score = scoreByVersionId[v.id]
              const has24hData = v.views > 0 || v.snapshots.some((s) => s.takenAt === '24h' && s.views > 0)
              const hasSecondaryPlatform = v.secondaryPlatform.length > 0
              const isEditingPlatform = editingSecondaryPlatform.has(v.id)
              const canDelete = versions.length > 2

              return (
                <div
                  key={v.id}
                  className={`group/panel rounded-xl p-4 border-2 animate-slideUp stagger-${Math.min(vIdx + 2, 8)} transition-transform duration-200 hover:-translate-y-0.5`}
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
                        {v.isWinner && <Crown size={12} className="text-[#ffd966] animate-crownTwinkle" fill="#ffd966" />}
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
                          className="pressable flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-white text-[#a07080] border border-[#e8d5c4] hover:text-[#ed4a7e] hover:border-[#ed4a7e]/50 hover:scale-105 transition-all duration-200"
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
                      <button
                        type="button"
                        onClick={() => canDelete && setDeletingVersion(v)}
                        title={canDelete ? 'Delete version' : 'Cannot delete — minimum 2 versions required'}
                        className={`p-1.5 bg-white border border-[#e8d5c4] rounded-lg transition-all ${
                          canDelete
                            ? 'text-[#b09090] hover:text-red-500 opacity-0 group-hover/panel:opacity-100 hover:opacity-100'
                            : 'text-[#dcc8b0] cursor-not-allowed opacity-30'
                        }`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Success score + secondary platform badges */}
                  {(score !== null || hasSecondaryPlatform) && (
                    <div className="flex items-center flex-wrap gap-1.5 mb-3">
                      {score !== null && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: scoreColor(score) + '1f', color: scoreColor(score) }}
                          title="Success score (0–100) — relative to other versions at the 24h snapshot"
                        >
                          Score {score}
                        </span>
                      )}
                      {hasSecondaryPlatform && v.secondaryPlatform.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#ed4a7e]/10 text-[#c02860]"
                          title={v.secondaryPlatformDate ? `Cross-posted on ${v.secondaryPlatformDate}` : undefined}
                        >
                          Also on {p}{v.secondaryPlatformDate ? ` — ${formatDate(v.secondaryPlatformDate)}` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Secondary platform prompt — only after 24h data is in */}
                  {has24hData && !hasSecondaryPlatform && (
                    <div className="mb-3">
                      {!isEditingPlatform ? (
                        <div className="flex items-center gap-2 text-[10px] text-[#a07080] bg-[#f5eee4] rounded-lg px-2.5 py-1.5">
                          <span>Did this version go anywhere else?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSecondaryPlatform((prev) => new Set([...prev, v.id]))
                              setSecondaryPlatformDraft((prev) => ({ ...prev, [v.id]: { platform: '', date: '' } }))
                            }}
                            className="ml-auto flex items-center gap-0.5 text-[#ed4a7e] hover:text-[#c02860] font-semibold transition-colors"
                          >
                            <Plus size={10} /> Add platform
                          </button>
                        </div>
                      ) : (
                        <div className="bg-[#faf9f7] border border-[#e8d5c4] rounded-lg p-2.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={secondaryPlatformDraft[v.id]?.platform ?? ''}
                              onChange={(e) =>
                                setSecondaryPlatformDraft((prev) => ({
                                  ...prev,
                                  [v.id]: { ...prev[v.id], platform: e.target.value },
                                }))
                              }
                              className="flex-1 bg-white border border-[#e8d5c4] rounded-md px-2 py-1 text-xs text-[#45132c] focus:outline-none focus:border-[#45132c]"
                            >
                              <option value="">Select platform...</option>
                              {SECONDARY_PLATFORMS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={secondaryPlatformDraft[v.id]?.date ?? ''}
                              onChange={(e) =>
                                setSecondaryPlatformDraft((prev) => ({
                                  ...prev,
                                  [v.id]: { ...prev[v.id], date: e.target.value },
                                }))
                              }
                              className="bg-white border border-[#e8d5c4] rounded-md px-2 py-1 text-xs text-[#45132c] focus:outline-none focus:border-[#45132c] [color-scheme:light]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveSecondaryPlatform(v.id)}
                              className="px-2.5 py-1 bg-[#45132c] hover:bg-[#ed4a7e] text-white text-xs rounded-md transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSecondaryPlatform((prev) => { const s = new Set(prev); s.delete(v.id); return s })
                              }}
                              className="p-1 text-[#a07080] hover:text-[#45132c] transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
