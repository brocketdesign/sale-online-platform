'use client'

import { useEffect, useState } from 'react'

interface PDFViewerProps {
  purchaseId: string
}

export default function PDFViewer({ purchaseId }: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/view/${purchaseId}`)
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          setUrl(data.url)
        } else {
          setError(data.error ?? 'Could not load file')
        }
      })
      .catch(() => setError('Failed to load PDF'))
  }, [purchaseId])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-magenta border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Loading PDF…</p>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      title="PDF Viewer"
      className="w-full h-full border-none"
    />
  )
}
