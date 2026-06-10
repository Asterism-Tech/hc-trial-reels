'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { CustomTag, TagCategory } from '@/lib/types'

const PRESET_TAGS: { name: string; category: TagCategory; color: string }[] = [
  { name: 'under-15s', category: 'duration', color: '#3B82F6' },
  { name: '15-30s', category: 'duration', color: '#3B82F6' },
  { name: '30-60s', category: 'duration', color: '#3B82F6' },
  { name: '60s+', category: 'duration', color: '#3B82F6' },
  { name: 'influencer-content', category: 'content-style', color: '#F97316' },
  { name: 'snappy-editing', category: 'content-style', color: '#F97316' },
  { name: 'slow-build', category: 'content-style', color: '#F97316' },
  { name: 'tutorial-style', category: 'content-style', color: '#F97316' },
  { name: 'product-focus', category: 'content-style', color: '#F97316' },
  { name: 'original-sound', category: 'audio', color: '#EC4899' },
  { name: 'trending-audio', category: 'audio', color: '#EC4899' },
  { name: 'voiceover', category: 'audio', color: '#EC4899' },
  { name: 'music-heavy', category: 'audio', color: '#EC4899' },
  { name: 'no-audio', category: 'audio', color: '#EC4899' },
  { name: '18-24', category: 'audience', color: '#14B8A6' },
  { name: '25-34', category: 'audience', color: '#14B8A6' },
  { name: '35-44', category: 'audience', color: '#14B8A6' },
  { name: 'broad-audience', category: 'audience', color: '#14B8A6' },
  { name: 'visual-hook', category: 'hook-type', color: '#EAB308' },
  { name: 'audio-hook', category: 'hook-type', color: '#EAB308' },
  { name: 'text-hook', category: 'hook-type', color: '#EAB308' },
  { name: 'question-hook', category: 'hook-type', color: '#EAB308' },
]

const CATEGORY_LABELS: Record<TagCategory, string> = {
  duration: 'Duration',
  'content-style': 'Content Style',
  audio: 'Audio',
  audience: 'Audience',
  'hook-type': 'Hook Type',
  custom: 'Custom',
}

interface TagPickerProps {
  selected: string[]
  onChange: (tags: string[]) => void
  customTags?: CustomTag[]
}

export default function TagPicker({ selected, onChange, customTags = [] }: TagPickerProps) {
  const [open, setOpen] = useState(false)

  const allTags = [
    ...PRESET_TAGS,
    ...customTags.map((t) => ({ name: t.name, category: t.category, color: t.color })),
  ]

  const grouped = allTags.reduce<Record<string, typeof PRESET_TAGS>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name))
    } else {
      onChange([...selected, name])
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-left hover:border-[#6B2D8B] transition-colors"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-h-[20px]">
          {selected.length === 0 ? (
            <span className="text-[#555]">Select tags...</span>
          ) : (
            selected.map((tag) => {
              const tagDef = allTags.find((t) => t.name === tag)
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: tagDef ? tagDef.color + '33' : '#2A2A2A',
                    color: tagDef ? tagDef.color : '#888',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(tag)
                    }}
                    className="hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            })
          )}
        </div>
        <ChevronDown size={14} className={`text-[#555] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {(Object.keys(grouped) as TagCategory[]).map((category) => (
            <div key={category} className="p-3 border-b border-[#2A2A2A] last:border-0">
              <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {grouped[category].map((tag) => {
                  const isSelected = selected.includes(tag.name)
                  return (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => toggle(tag.name)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? tag.color + '33' : 'transparent',
                        color: tag.color,
                        borderColor: tag.color + '66',
                      }}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { PRESET_TAGS, CATEGORY_LABELS }
