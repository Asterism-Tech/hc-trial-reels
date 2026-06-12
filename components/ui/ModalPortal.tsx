'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders modal content at document.body. Modals must not render inside
 * cards: animated/hovered ancestors carry a CSS transform, which makes
 * position:fixed resolve against the card instead of the viewport (and
 * overflow-hidden then clips the dialog).
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}
