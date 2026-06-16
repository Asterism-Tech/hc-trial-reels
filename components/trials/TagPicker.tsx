'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { CustomTag, TagCategory } from '@/lib/types'

// The global tag vocabulary, chosen as pills. Categories and values mirror
// the Hobbycraft brief so the team tags every trial the same way.
const PRESET_TAGS: { name: string; category: TagCategory; color: string }[] = [
  // Test Type
  { name: 'Voiceover Test', category: 'test-type', color: '#7C3AED' },
  { name: 'Visual Opening', category: 'test-type', color: '#7C3AED' },
  { name: 'Music', category: 'test-type', color: '#7C3AED' },
  { name: 'No Voiceover vs Voiceover', category: 'test-type', color: '#7C3AED' },
  { name: 'Caption', category: 'test-type', color: '#7C3AED' },
  // Age of Viewers
  { name: '13-17', category: 'audience', color: '#14B8A6' },
  { name: '18-24', category: 'audience', color: '#14B8A6' },
  { name: '25-34', category: 'audience', color: '#14B8A6' },
  { name: '35-44', category: 'audience', color: '#14B8A6' },
  { name: '45-54', category: 'audience', color: '#14B8A6' },
  { name: '55-64', category: 'audience', color: '#14B8A6' },
  { name: '65+', category: 'audience', color: '#14B8A6' },
  // Type of Audio
  { name: 'Trending', category: 'audio', color: '#F59E0B' },
  { name: 'Generic / Themed', category: 'audio', color: '#F59E0B' },
  { name: 'Soft Instrumental', category: 'audio', color: '#F59E0B' },
  { name: 'Remix', category: 'audio', color: '#F59E0B' },
  // Hook Type
  { name: 'Visual Hook', category: 'hook-type', color: '#2563EB' },
  { name: 'Audio Hook', category: 'hook-type', color: '#2563EB' },
  // Video Length
  { name: '15-20s', category: 'video-length', color: '#0EA5E9' },
  { name: '20-30s', category: 'video-length', color: '#0EA5E9' },
  { name: '30-45s', category: 'video-length', color: '#0EA5E9' },
  { name: '45-55s', category: 'video-length', color: '#0EA5E9' },
  { name: '60s-1.15m', category: 'video-length', color: '#0EA5E9' },
  // Content Theme
  { name: 'Ideas/Projects/How to', category: 'content-theme', color: '#16A34A' },
  { name: 'Product', category: 'content-theme', color: '#16A34A' },
  { name: 'Trends', category: 'content-theme', color: '#16A34A' },
  // Format
  { name: 'Text Overlay', category: 'format', color: '#6366F1' },
  { name: 'Voiceover', category: 'format', color: '#6366F1' },
  { name: 'Face on Camera', category: 'format', color: '#6366F1' },
  { name: 'Detectable Person', category: 'format', color: '#6366F1' },
]

const CATEGORY_LABELS: Record<TagCategory, string> = {
  'test-type': 'Test Type',
  audience: 'Age of Viewers',
  audio: 'Type of Audio',
  'hook-type': 'Hook Type',
  'video-length': 'Video Length',
  'content-theme': 'Content Theme',
  format: 'Format',
  custom: 'Custom',
}

/** Label for any category string, falling back gracefully for legacy values. */
function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as TagCategory] ?? category.replace(/-/g, ' ')
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
        className="w-full flex items-center justify-between bg-[#faf9f7] border border-[#e8d5c4] rounded-lg px-3 py-2 text-sm text-left hover:border-[#45132c] transition-colors duration-200"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-h-[20px]">
          {selected.length === 0 ? (
            <span className="text-[#b09090]">Select tags...</span>
          ) : (
            selected.map((tag) => {
              const tagDef = allTags.find((t) => t.name === tag)
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: tagDef ? tagDef.color + '22' : '#f0e6d3',
                    color: tagDef ? tagDef.color : '#8a5a70',
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
        <ChevronDown size={14} className={`text-[#a07080] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#e8d5c4] rounded-xl shadow-[0_4px_12px_rgba(69,19,44,0.1)] max-h-72 overflow-y-auto">
          {(Object.keys(grouped) as TagCategory[]).map((category) => (
            <div key={category} className="p-3 border-b border-[#f0e6d3] last:border-0">
              <p className="text-[10px] font-semibold text-[#a07080] uppercase tracking-wider mb-2">
                {categoryLabel(category)}
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
                        backgroundColor: isSelected ? tag.color + '22' : 'transparent',
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

export { PRESET_TAGS, CATEGORY_LABELS, categoryLabel }
