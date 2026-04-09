'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface Props {
  title: string
}

export default function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled or share failed — fall through to clipboard
        await copyToClipboard(url)
      }
    } else {
      await copyToClipboard(url)
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title={copied ? 'Link copied!' : 'Share'}
      className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors shrink-0"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
    </button>
  )
}
