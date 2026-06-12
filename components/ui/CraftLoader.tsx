'use client'

import { useState, useEffect } from 'react'
import { Scissors } from 'lucide-react'

const CRAFT_MESSAGES = [
  'Stitching together your data...',
  'Sew far, sew good...',
  'Threading the needle...',
  'Knit one, purl two...',
  'Cutting along the dotted line...',
  'Adding a sprinkle of glitter...',
  'Waiting for the glue gun to warm up...',
  'Unravelling the trends...',
  'Pinning down the patterns...',
  'Crocheting the conclusions...',
  'Decoupaging the details...',
  'Felting the final touches...',
]

interface CraftLoaderProps {
  /** Rough expected duration in ms — the bar eases towards 90% over this time and holds until unmounted */
  expectedMs?: number
}

export default function CraftLoader({ expectedMs = 12000 }: CraftLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * CRAFT_MESSAGES.length))

  useEffect(() => {
    const start = performance.now()
    const interval = setInterval(() => {
      const elapsed = performance.now() - start
      // Ease towards 90% and wait there — completion comes when the loader unmounts
      setProgress(90 * (1 - Math.exp(-elapsed / (expectedMs / 2.5))))
    }, 120)
    return () => clearInterval(interval)
  }, [expectedMs])

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % CRAFT_MESSAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white border-2 border-dashed border-[#f5a3c7]/60 rounded-xl p-5 animate-scaleIn">
      <div className="flex items-center gap-2 mb-3">
        <Scissors size={15} className="text-[#ed4a7e] animate-floaty" />
        <p key={msgIndex} className="text-sm text-[#45132c] font-medium animate-fadeIn">
          {CRAFT_MESSAGES[msgIndex]}
        </p>
      </div>
      <div className="h-2 bg-[#f5eee4] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#ed4a7e] relative overflow-hidden transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* a little shine running along the thread */}
          <div className="absolute inset-0 skeleton-shimmer opacity-30" />
        </div>
      </div>
      <p className="text-[10px] text-[#a07080] mt-2">Generating AI insights — this takes a few seconds</p>
    </div>
  )
}
