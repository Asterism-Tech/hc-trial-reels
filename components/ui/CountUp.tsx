'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  format?: (n: number) => string
  duration?: number
}

/** Animates a stat from 0 to its value with an ease-out curve. */
export default function CountUp({ value, format = (n) => String(Math.round(n)), duration = 800 }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return <span className="tabular-nums">{format(display)}</span>
}
