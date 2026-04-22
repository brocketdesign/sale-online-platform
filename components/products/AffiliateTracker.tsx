'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/** Fires once on mount to register an affiliate click when ?ref=CODE is present. */
export default function AffiliateTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('ref')
    if (!code || !/^[a-z0-9]{6,16}$/.test(code)) return

    fetch('/api/affiliates/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {/* non-critical */})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
