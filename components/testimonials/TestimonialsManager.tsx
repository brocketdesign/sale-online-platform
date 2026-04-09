'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Eye, EyeOff, MessageCircle, Loader2 } from 'lucide-react'
import WhatsAppScreenshot, { type ChatTestimonial } from '@/components/testimonials/WhatsAppScreenshot'
import TestimonialEditorForm from '@/components/testimonials/TestimonialEditorForm'

interface Props {
  productId: string
  productTitle: string
  productDescription?: string
  initialTestimonials: ChatTestimonial[]
  sellerName?: string
  sellerAvatarUrl?: string | null
}

type Mode = 'list' | 'create' | 'edit'

export default function TestimonialsManager({
  productId,
  productTitle,
  productDescription,
  initialTestimonials,
  sellerName,
  sellerAvatarUrl,
}: Props) {
  const [testimonials, setTestimonials] = useState<ChatTestimonial[]>(initialTestimonials)
  const [mode, setMode] = useState<Mode>('list')
  const [editing, setEditing] = useState<ChatTestimonial | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleSaved(t: ChatTestimonial) {
    setTestimonials((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = t
        return next
      }
      return [t, ...prev]
    })
    setMode('list')
    setEditing(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggle(t: ChatTestimonial) {
    const res = await fetch(`/api/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !(t as any).is_active }),
    })
    const updated = await res.json()
    setTestimonials((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
  }

  // ── Render ────────────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    return (
      <TestimonialEditorForm
        productId={productId}
        productTitle={productTitle}
        productDescription={productDescription}
        initial={editing}
        onSaved={handleSaved}
        onCancel={() => { setMode('list'); setEditing(null) }}
        sellerName={sellerName}
        sellerAvatarUrl={sellerAvatarUrl}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{testimonials.length} screenshot testimonial{testimonials.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setMode('create') }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-16 text-center border border-dashed border-gray-200">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">No screenshot testimonials yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add realistic WhatsApp-style screenshots to build social proof.</p>
          <button
            onClick={() => { setEditing(null); setMode('create') }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] text-sm"
          >
            <Plus className="w-4 h-4" />
            Create your first testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="relative group">
              <WhatsAppScreenshot testimonial={t} sellerName={sellerName} sellerAvatarUrl={sellerAvatarUrl} />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-2xl transition-all flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditing(t); setMode('edit') }}
                    className="p-2.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleToggle(t)}
                    className="p-2.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title={(t as any).is_active ? 'Hide' : 'Show'}
                  >
                    {(t as any).is_active
                      ? <Eye className="w-4 h-4 text-[#25d366]" />
                      : <EyeOff className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    {deletingId === t.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      : <Trash2 className="w-4 h-4 text-red-500" />
                    }
                  </button>
                </div>
              </div>
              {/* Hidden badge */}
              {!(t as any).is_active && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Hidden
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
