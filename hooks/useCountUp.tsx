'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpOptions {
  end: number
  duration?: number
  delay?: number
  /** After reaching end, keep ticking by this amount every liveInterval ms to simulate live growth */
  liveIncrement?: number
  liveInterval?: number
}

/**
 * Animates a number from 0 to `end` using an ease-out cubic curve.
 * Optionally continues incrementing after the animation to simulate live data.
 */
export function useCountUp({
  end,
  duration = 2200,
  delay = 0,
  liveIncrement = 0,
  liveInterval = 4000,
}: CountUpOptions): number {
  const [value, setValue] = useState(0)
  const liveRef = useRef(end)

  useEffect(() => {
    let rafId: number
    let startTime: number | null = null
    let liveTimer: ReturnType<typeof setInterval>

    const run = (ts: number) => {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * end)
      if (progress < 1) {
        rafId = requestAnimationFrame(run)
      } else {
        liveRef.current = end
        if (liveIncrement > 0) {
          liveTimer = setInterval(() => {
            liveRef.current += liveIncrement
            setValue(liveRef.current)
          }, liveInterval)
        }
      }
    }

    const startTimer = setTimeout(() => {
      rafId = requestAnimationFrame(run)
    }, delay)

    return () => {
      clearTimeout(startTimer)
      cancelAnimationFrame(rafId)
      clearInterval(liveTimer)
    }
  }, [end, duration, delay, liveIncrement, liveInterval])

  return value
}
