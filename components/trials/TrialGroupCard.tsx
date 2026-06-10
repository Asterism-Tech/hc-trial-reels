'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp, Crown, Eye, EyeOff } from 'lucide-react'
import { TrialGroup, Version } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Badge, { statusBadgeVariant } from '@/components/ui/Badge'
import VersionChip from './VersionChip'
import VersionComparisonTable from './VersionComparisonTable'
import StatBar from './StatBar'
import { formatDate, isSafeImageUrl } from '@/lib/utils'

interface TrialGroupCardProps {
  group: TrialGroup
  onUpdate: (updated: TrialGroup) => void
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
        className="w-20 bg-[#0F0F0F] border border-[#6B2D8B] rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
        step={field === 'completionRatePct' ? '0.01' : '1'}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xs text-white hover:text-[#A855D4] transition-colors cursor-pointer font-mono"
      title="Click to edit"
    >
      {String(version[field] ?? '—')}
    </button>
  )
}

export default function TrialGroupCard({ group, onUpdate, defaultExpanded = false }: TrialGroupCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [versions, setVersions] = useState<Version[]>(group.versions)
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const handleStatSave = useCallback((versionId: string, snakeField: string, value: number) => {
    // Optimistic update
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

  const handleSetWinner = async (versionId: string) => {
    const updates = versions.map((v) => ({
      id: v.id,
      is_winner: v.id === versionId,
    }))
    for (const u of updates) {
      await supabase.from('versions').update({ is_winner: u.is_winner }).eq('id', u.id)
    }
    await supabase.from('trial_groups').update({ status: 'won', updated_at: new Date().toISOString() }).eq('id', group.id)
    setVersions((prev) => prev.map((v) => ({ ...v, isWinner: v.id === versionId })))
    onUpdate({ ...group, status: 'won', versions: versions.map((v) => ({ ...v, isWinner: v.id === versionId })) })
    toast.success('Winner marked! 👑')
  }

  const handleTogglePublished = async (versionId: string, current: boolean) => {
    await supabase.from('versions').update({ is_published: !current }).eq('id', versionId)
    setVersions((prev) => prev.map((v) => v.id === versionId ? { ...v, isPublished: !current } : v))
    toast.success(!current ? 'Marked as published' : 'Unpublished')
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
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden animate-fadeIn">
      {/* Card Header */}
      <div
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-[#1F1F1F] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-white text-sm truncate">{group.name}</h3>
            <Badge variant={statusBadgeVariant(group.status)}>
              {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
            </Badge>
            {group.testType && (
              <span className="text-xs px-2 py-0.5 bg-[#2A2A2A] text-[#888] rounded-full">{group.testType}</span>
            )}
          </div>
          {group.contentTheme.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {group.contentTheme.map((theme) => (
                <span key={theme} className="text-[10px] text-[#555] bg-[#222] px-2 py-0.5 rounded">{theme}</span>
              ))}
            </div>
          )}
          {/* Version chips */}
          <div className="flex flex-wrap gap-1.5">
            {versions.map((v) => (
              <VersionChip key={v.id} version={v} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#555]">Published</p>
            <p className="text-xs text-[#888]">{formatDate(group.publishDate)}</p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-[#555]" /> : <ChevronDown size={16} className="text-[#555]" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[#2A2A2A] p-4 space-y-6">
          {/* Comparison table */}
          <div>
            <h4 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">Version Comparison</h4>
            <VersionComparisonTable versions={versions} />
          </div>

          {/* Stat bars */}
          {versions.some((v) => v.views > 0) && (
            <div>
              <h4 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">Performance</h4>
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
            {versions.map((v) => (
              <div key={v.id} className={`bg-[#0F0F0F] rounded-xl p-4 border ${v.isWinner ? 'border-[#F5B942]/30' : 'border-[#2A2A2A]'}`}>
                {/* Version header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${v.isWinner ? 'text-[#F5B942]' : 'text-white'}`}>
                      V{v.versionNumber} {v.isWinner ? '👑' : ''}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetWinner(v.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                        v.isWinner
                          ? 'bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30'
                          : 'bg-[#1A1A1A] text-[#555] border border-[#2A2A2A] hover:text-[#F5B942] hover:border-[#F5B942]/30'
                      }`}
                      title={v.isWinner ? 'Winner' : 'Mark as winner'}
                    >
                      <Crown size={10} />
                      <span>{v.isWinner ? 'Winner' : 'Mark'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(v.id, v.isPublished)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                        v.isPublished
                          ? 'bg-[#6B2D8B]/20 text-[#A855D4] border border-[#6B2D8B]/30'
                          : 'bg-[#1A1A1A] text-[#555] border border-[#2A2A2A] hover:text-[#A855D4]'
                      }`}
                    >
                      {v.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                      <span>{v.isPublished ? 'Published' : 'Publish'}</span>
                    </button>
                  </div>
                </div>

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
                      <span className="text-[10px] text-[#555]">{sf.label}</span>
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
                  <p className="text-[10px] text-[#555] mb-1">Team Comments</p>
                  <TeamCommentArea
                    versionId={v.id}
                    initial={v.teamComments}
                    onSave={handleTeamCommentSave}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
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
      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-1.5 text-xs text-[#ccc] placeholder-[#333] focus:outline-none focus:border-[#6B2D8B] resize-none"
    />
  )
}
