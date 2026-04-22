'use client'

import { useEffect } from 'react'

/**
 * Attaches a single document-level click listener that injects a ripple
 * `<span>` into any button or link the user clicks.
 *
 * The ripple colour adapts to the element:
 *  - Light ripple for dark/primary buttons
 *  - Pink ripple for ghost / outline elements
 */
export default function ClickRipple() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el = target.closest<HTMLElement>('button, a, [role="button"]')
      if (!el) return

      // Detect whether the element has a dark background to pick ripple colour
      const computed = getComputedStyle(el)
      const bg = computed.backgroundColor
      // Rough check: if background is darkish, use a white ripple; otherwise pink
      const isDark =
        bg.includes('rgb(26') || // brand-black
        bg.includes('rgb(255, 0') || // magenta
        bg.includes('rgb(220') || // red
        bg.includes('rgb(31') ||
        bg.includes('rgb(17')
      const rippleColor = isDark
        ? 'rgba(255,255,255,0.28)'
        : 'rgba(255,0,122,0.18)'

      const rect = el.getBoundingClientRect()
      const diameter = Math.max(rect.width, rect.height)

      const ripple = document.createElement('span')
      ripple.className = 'ripple-wave'
      ripple.style.cssText = `
        width: ${diameter}px;
        height: ${diameter}px;
        left: ${e.clientX - rect.left - diameter / 2}px;
        top: ${e.clientY - rect.top - diameter / 2}px;
        background: ${rippleColor};
      `

      // Make sure the host element clips the ripple
      const prevPosition = computed.position
      const prevOverflow = computed.overflow
      if (prevPosition === 'static') el.style.position = 'relative'
      if (prevOverflow === 'visible') el.style.overflow = 'hidden'

      el.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
