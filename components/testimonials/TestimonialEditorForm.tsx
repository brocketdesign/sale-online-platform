'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Sparkles, Loader2, Trash2, Check, RefreshCw, Plus, X } from 'lucide-react'
import WhatsAppScreenshot, { type Reaction, type ChatTestimonial } from './WhatsAppScreenshot'

interface Props {
  productId: string
  productTitle: string
  productDescription?: string
  /** Existing testimonial to edit; null means create-new mode */
  initial?: ChatTestimonial | null
  onSaved: (t: ChatTestimonial) => void
  onCancel: () => void
}

const DEFAULT: Omit<ChatTestimonial, 'id'> = {
  sender_name: 'Happy Customer',
  sender_avatar_url: null,
  message: '',
  display_time: '14:23',
  display_date: 'Today',
  reactions: [{ emoji: '❤️', count: 5 }, { emoji: '🔥', count: 3 }],
  likes_count: 8,
  background_url: null,
  chat_bg_color: '#ECE5DD',
}

export default function TestimonialEditorForm({
  productId,
  productTitle,
  productDescription,
  initial,
  onSaved,
  onCancel,
}: Props) {
  const [form, setForm] = useState<Omit<ChatTestimonial, 'id'>>(() =>
    initial ? { ...initial } : { ...DEFAULT }
  )
  const [newReactionEmoji, setNewReactionEmoji] = useState('')
  const [newReactionCount, setNewReactionCount] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [isGeneratingBg, setIsGeneratingBg] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── AI generation ──────────────────────────────────────────
  async function generateAll() {
    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/testimonials/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          productDescription,
          generateAvatar: true,
          generateBackground: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm((f) => ({
        ...f,
        sender_name: data.senderName ?? f.sender_name,
        message: data.message ?? f.message,
        display_time: data.displayTime ?? f.display_time,
        display_date: data.displayDate ?? f.display_date,
        reactions: data.reactions ?? f.reactions,
        sender_avatar_url: data.senderAvatarUrl ?? f.sender_avatar_url,
      }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  async function generateAvatarOnly() {
    setIsGeneratingAvatar(true)
    setError(null)
    try {
      const res = await fetch('/api/testimonials/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          productDescription,
          generateAvatar: true,
          generateBackground: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.senderAvatarUrl) setForm((f) => ({ ...f, sender_avatar_url: data.senderAvatarUrl }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Avatar generation failed')
    } finally {
      setIsGeneratingAvatar(false)
    }
  }

  async function generateBgOnly() {
    setIsGeneratingBg(true)
    setError(null)
    try {
      const res = await fetch('/api/testimonials/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          generateAvatar: false,
          generateBackground: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.backgroundUrl) setForm((f) => ({ ...f, background_url: data.backgroundUrl }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Background generation failed')
    } finally {
      setIsGeneratingBg(false)
    }
  }

  // ── Save ──────────────────────────────────────────────────
  function handleSave() {
    startTransition(async () => {
      setError(null)
      try {
        const isEdit = !!initial?.id
        const url = isEdit ? `/api/testimonials/${initial!.id}` : '/api/testimonials'
        const method = isEdit ? 'PATCH' : 'POST'

        const body = isEdit
          ? form
          : { ...form, product_id: productId }

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        onSaved(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  // ── Reactions ────────────────────────────────────────────
  function addReaction() {
    if (!newReactionEmoji.trim()) return
    setForm((f) => ({
      ...f,
      reactions: [...f.reactions, { emoji: newReactionEmoji.trim(), count: newReactionCount }],
    }))
    setNewReactionEmoji('')
    setNewReactionCount(1)
  }

  function removeReaction(index: number) {
    setForm((f) => ({ ...f, reactions: f.reactions.filter((_, i) => i !== index) }))
  }

  const preview: ChatTestimonial = { id: initial?.id ?? 'preview', ...form }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Live preview ── */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preview</p>
        <WhatsAppScreenshot testimonial={preview} />
      </div>

      {/* ── Controls ── */}
      <div className="flex-1 space-y-5 min-w-0">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* AI generate button */}
        <button
          type="button"
          onClick={generateAll}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-[#FF007A] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGenerating ? 'Generating…' : 'Generate with AI'}
        </button>

        {/* Sender name */}
        <label className="block">
          <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Sender name</span>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
            value={form.sender_name}
            onChange={(e) => setForm((f) => ({ ...f, sender_name: e.target.value }))}
            placeholder="e.g. Sarah M."
          />
        </label>

        {/* Avatar */}
        <div>
          <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Sender avatar</span>
          <div className="flex items-center gap-3">
            {form.sender_avatar_url ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image src={form.sender_avatar_url} alt="" fill className="object-cover" sizes="40px" unoptimized />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {form.sender_name.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
              placeholder="https://... or leave blank"
              value={form.sender_avatar_url ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, sender_avatar_url: e.target.value || null }))}
            />
            <button
              type="button"
              onClick={generateAvatarOnly}
              disabled={isGeneratingAvatar}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
              title="Generate avatar with AI"
            >
              {isGeneratingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              AI
            </button>
          </div>
        </div>

        {/* Message */}
        <label className="block">
          <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</span>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 resize-y min-h-[90px]"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Customer testimonial message…"
          />
        </label>

        {/* Time + Date */}
        <div className="flex gap-4">
          <label className="flex-1 block">
            <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Time</span>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
              value={form.display_time}
              onChange={(e) => setForm((f) => ({ ...f, display_time: e.target.value }))}
              placeholder="14:23"
            />
          </label>
          <label className="flex-1 block">
            <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Date label</span>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
              value={form.display_date}
              onChange={(e) => setForm((f) => ({ ...f, display_date: e.target.value }))}
              placeholder="Today"
            />
          </label>
        </div>

        {/* Reactions */}
        <div>
          <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Reactions</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.reactions.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full pl-2 pr-1 py-0.5 text-sm"
              >
                {r.emoji}
                <span className="text-xs text-gray-500">{r.count}</span>
                <button
                  type="button"
                  onClick={() => removeReaction(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
              placeholder="😊"
              value={newReactionEmoji}
              onChange={(e) => setNewReactionEmoji(e.target.value)}
              maxLength={4}
            />
            <input
              type="number"
              min={1}
              max={99}
              className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
              value={newReactionCount}
              onChange={(e) => setNewReactionCount(Number(e.target.value))}
            />
            <button
              type="button"
              onClick={addReaction}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>

        {/* Background */}
        <div>
          <span className="text-sm font-semibold text-gray-700 mb-1.5 block">Chat background</span>
          <div className="flex items-center gap-3">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
              placeholder="Image URL or leave blank for colour"
              value={form.background_url ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, background_url: e.target.value || null }))}
            />
            <button
              type="button"
              onClick={generateBgOnly}
              disabled={isGeneratingBg}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
              title="Generate background with AI"
            >
              {isGeneratingBg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI BG
            </button>
            {/* Colour fallback */}
            <label className="flex items-center gap-1.5 cursor-pointer" title="Fallback colour">
              <input
                type="color"
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                value={form.chat_bg_color}
                onChange={(e) => setForm((f) => ({ ...f, chat_bg_color: e.target.value }))}
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !form.message.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] transition-colors disabled:opacity-60 text-sm shadow-sm"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {initial ? 'Save changes' : 'Add testimonial'}
          </button>
        </div>
      </div>
    </div>
  )
}
