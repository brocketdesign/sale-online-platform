'use client'

import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Shows a slim pink progress bar at the very top of the page whenever the
 * user clicks an internal link.  It starts immediately on click (giving
 * instant feedback) and completes once the new pathname is committed.
 */
function ProgressBar() {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)

  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = useCallback(() => {
    clear()
    setVisible(true)
    setWidth(8)
    let w = 8
    intervalRef.current = setInterval(() => {
      // Asymptotically approach 90% so the bar never finishes on its own
      w = w + (90 - w) * 0.08
      setWidth(w)
    }, 180)
  }, [])

  const finish = useCallback(() => {
    clear()
    setWidth(100)
    const t = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 320)
    return () => clearTimeout(t)
  }, [])

  // Listen for clicks on internal <a> tags – fires BEFORE navigation starts
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      // Skip external links, hash-only links, mailto, tel
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel')
      ) return
      start()
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [start])

  // Complete the bar when the new route is actually rendered
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      finish()
    }
  }, [pathname, finish])

  if (!visible) return null

  return (
    <div
      className="nav-progress-bar"
      style={{ width: `${width}%` }}
      aria-hidden="true"
    />
  )
}

// Suspense boundary required because usePathname can suspend
export default function NavigationProgress() {
  return (
    <Suspense>
      <ProgressBar />
    </Suspense>
  )
}
