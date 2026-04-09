'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Heart, HeartOff } from 'lucide-react'

const STORAGE_KEY = 'sellify_wishlist'

function getWishlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function setWishlist(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

interface Props {
  productId: string
  productTitle: string
}

export default function WishlistButton({ productId, productTitle }: Props) {
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSaved(getWishlist().includes(productId))
  }, [productId])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function addToWishlist() {
    const list = getWishlist()
    if (!list.includes(productId)) {
      setWishlist([...list, productId])
      setSaved(true)
    }
    setOpen(false)
  }

  function removeFromWishlist() {
    const list = getWishlist().filter((id) => id !== productId)
    setWishlist(list)
    setSaved(false)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {saved ? (
            <Heart className="w-4 h-4 text-[#FF007A] fill-[#FF007A]" />
          ) : (
            <Heart className="w-4 h-4 text-gray-400" />
          )}
          {saved ? 'Saved' : 'Add to wishlist'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {!saved ? (
            <button
              type="button"
              onClick={addToWishlist}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-4 h-4 text-[#FF007A]" />
              Save to wishlist
            </button>
          ) : (
            <button
              type="button"
              onClick={removeFromWishlist}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HeartOff className="w-4 h-4 text-gray-400" />
              Remove from wishlist
            </button>
          )}
        </div>
      )}
    </div>
  )
}
