'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { Sparkles, Loader2, Trash2, Check, RefreshCw, Upload, Shuffle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import WhatsAppScreenshot, { type Reaction, type ChatTestimonial } from './WhatsAppScreenshot'

interface Props {
  productId: string
  productTitle: string
  productDescription?: string
  /** Existing testimonial to edit; null means create-new mode */
  initial?: ChatTestimonial | null
  onSaved: (t: ChatTestimonial) => void
  onCancel: () => void
  /** Seller display name shown in the group-chat header */
  sellerName?: string
  /** Seller avatar URL shown in the group-chat header */
  sellerAvatarUrl?: string | null
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
  sellerName,
  sellerAvatarUrl,
}: Props) {
  const [form, setForm] = useState<Omit<ChatTestimonial, 'id'>>(() =>
    initial ? { ...initial } : { ...DEFAULT }
  )
  const [isPending, startTransition] = useTransition()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)
  const [avatarGender, setAvatarGender] = useState<string | null>(null)
  const [avatarEthnicity, setAvatarEthnicity] = useState<string | null>(null)
  const [avatarAge, setAvatarAge] = useState<string | null>(null)

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
          avatarGender,
          avatarEthnicity,
          avatarAge,
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

  async function uploadAvatarFile(file: File) {
    setIsUploadingAvatar(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('testimonial-assets')
        .upload(path, file, { upsert: false })
      if (uploadError) throw new Error(uploadError.message)
      const { data: { publicUrl } } = supabase.storage
        .from('testimonial-assets')
        .getPublicUrl(path)
      setForm((f) => ({ ...f, sender_avatar_url: publicUrl }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarFileRef.current) avatarFileRef.current.value = ''
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
          avatarGender,
          avatarEthnicity,
          avatarAge,
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

  function randomizeDateTime() {
    const h = Math.floor(Math.random() * 15) + 8
    const m = Math.floor(Math.random() * 60)
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const daysAgo = Math.floor(Math.random() * 7)
    let dateLabel: string
    if (daysAgo === 0) dateLabel = 'Today'
    else if (daysAgo === 1) dateLabel = 'Yesterday'
    else {
      const d = new Date()
      d.setDate(d.getDate() - daysAgo)
      dateLabel = d.toLocaleDateString('en-US', { weekday: 'long' })
    }
    setForm((f) => ({ ...f, display_time: time, display_date: dateLabel }))
  }

  // ── Save ─────────────────────────────────────────────────
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

  const preview: ChatTestimonial = { id: initial?.id ?? 'preview', ...form }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Live preview ── */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preview</p>
        <WhatsAppScreenshot testimonial={preview} sellerName={sellerName} sellerAvatarUrl={sellerAvatarUrl} />
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

          {/* Avatar descriptor tags */}
          <div className="space-y-2 mb-3">
            {/* Gender */}
            <div className="flex flex-wrap gap-1.5">
              {(['Male', 'Female', 'Non-binary'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setAvatarGender(avatarGender === g ? null : g)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    avatarGender === g
                      ? 'bg-[#FF007A] border-[#FF007A] text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {/* Ethnicity */}
            <div className="flex flex-wrap gap-1.5">
              {(['Asian', 'Black', 'Hispanic', 'Middle Eastern', 'South Asian', 'White'] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setAvatarEthnicity(avatarEthnicity === e ? null : e)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    avatarEthnicity === e
                      ? 'bg-[#FF007A] border-[#FF007A] text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            {/* Age range */}
            <div className="flex flex-wrap gap-1.5">
              {(['18–25', '26–35', '36–45', '46–60', '60+'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatarAge(avatarAge === a ? null : a)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    avatarAge === a
                      ? 'bg-[#FF007A] border-[#FF007A] text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

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
            {/* Hidden file input */}
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadAvatarFile(file)
              }}
            />
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={isUploadingAvatar}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
              title="Upload image"
            >
              {isUploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            </button>
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
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-700">Time &amp; Date</span>
            <button
              type="button"
              onClick={randomizeDateTime}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
              title="Randomize time and date"
            >
              <Shuffle className="w-3 h-3" />
              Randomize
            </button>
          </div>
          <div className="flex gap-4">
            <label className="flex-1 block">
              <span className="text-xs text-gray-500 mb-1 block">Time</span>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
                value={form.display_time}
                onChange={(e) => setForm((f) => ({ ...f, display_time: e.target.value }))}
                placeholder="14:23"
              />
            </label>
            <label className="flex-1 block">
              <span className="text-xs text-gray-500 mb-1 block">Date label</span>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40"
                value={form.display_date}
                onChange={(e) => setForm((f) => ({ ...f, display_date: e.target.value }))}
                placeholder="Today"
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
