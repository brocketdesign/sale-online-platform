'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Lock, Star } from 'lucide-react'

interface Props {
  purchaseId: string
  purchasedAt: string
  productId: string
  reviewAlreadySubmitted: boolean
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export default function ReviewSection({ purchaseId, purchasedAt, productId, reviewAlreadySubmitted }: Props) {
  const [scrolledEnough, setScrolledEnough] = useState(false)
  const [reviewUnlocked, setReviewUnlocked] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)
  const [hoursLeft, setHoursLeft] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const purchaseDate = new Date(purchasedAt).getTime()
    const now = Date.now()
    const unlocked = now - purchaseDate >= THREE_DAYS_MS
    setReviewUnlocked(unlocked)
    if (!unlocked) {
      const remaining = THREE_DAYS_MS - (now - purchaseDate)
      setDaysLeft(Math.floor(remaining / (24 * 60 * 60 * 1000)))
      setHoursLeft(Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)))
    }
  }, [purchasedAt])

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (el) {
        const { top } = el.getBoundingClientRect()
        if (top < window.innerHeight * 0.8) setScrolledEnough(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (reviewAlreadySubmitted) {
    return (
      <div className="mt-12 p-6 bg-green-50 border border-green-100 rounded-2xl text-center">
        <Star className="w-8 h-8 text-green-500 mx-auto mb-2 fill-green-500" />
        <p className="font-medium text-green-800">You already reviewed this product — thank you!</p>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="mt-12">
      {!reviewUnlocked ? (
        <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl text-center">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Review unlocks soon</h3>
          <p className="text-gray-500 text-sm mb-3">
            We want to make sure you&apos;ve had time to read the content before leaving a review.
          </p>
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-magenta">{daysLeft}</div>
              <div className="text-xs text-gray-400">days</div>
            </div>
            <div className="text-gray-300 text-xl">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-magenta">{hoursLeft}</div>
              <div className="text-xs text-gray-400">hours</div>
            </div>
          </div>
        </div>
      ) : !scrolledEnough ? (
        <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl text-center">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Keep reading to unlock your review</h3>
          <p className="text-gray-500 text-sm">Scroll down through the content above to enable your review.</p>
        </div>
      ) : (
        <EmbeddedReviewForm productId={productId} />
      )}
    </div>
  )
}

/* ─── Inline Review form ──────────────────────────────────────────────────── */
function EmbeddedReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    if (title.length < 3) { setError('Title must be at least 3 characters'); return }
    if (body.length < 10) { setError('Please write at least 10 characters'); return }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to submit review')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-8 bg-green-50 border border-green-100 rounded-2xl text-center">
        <Star className="w-8 h-8 text-green-500 mx-auto mb-2 fill-green-500" />
        <h3 className="font-semibold text-green-800">Review submitted — thank you!</h3>
        <p className="text-green-600 text-sm mt-1">Your feedback helps others discover great content.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 text-lg">Leave a Review</h3>

      {/* Star Picker */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hovered || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Sum it up in a few words…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 bg-white"
          maxLength={100}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Your Review</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          placeholder="What did you think? What was most valuable?"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 bg-white resize-none"
          maxLength={2000}
        />
        <div className="text-xs text-gray-400 text-right mt-1">{body.length}/2000</div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-magenta text-white font-semibold py-3 rounded-xl hover:bg-brand-magenta/90 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
