'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'

type StarCounts = { 5: number; 4: number; 3: number; 2: number; 1: number }

interface Props {
  productId: string
  initialCounts: StarCounts
}

function computeAvg(counts: StarCounts): number {
  const total = (counts[5] + counts[4] + counts[3] + counts[2] + counts[1])
  if (total === 0) return 0
  const sum = 5 * counts[5] + 4 * counts[4] + 3 * counts[3] + 2 * counts[2] + 1 * counts[1]
  return sum / total
}

export default function RatingGeneratorDashboard({ productId, initialCounts }: Props) {
  const [counts, setCounts] = useState<StarCounts>({ ...initialCounts })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const total = counts[5] + counts[4] + counts[3] + counts[2] + counts[1]
  const avg = computeAvg(counts)

  function setStarCount(star: 1 | 2 | 3 | 4 | 5, value: string) {
    const n = parseInt(value, 10)
    setCounts(prev => ({ ...prev, [star]: isNaN(n) || n < 0 ? 0 : n }))
    setResult(null)
  }

  async function handleSave() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ratings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, distribution: counts }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Unknown error')
      setResult({
        type: 'success',
        message: `Saved ${json.created} synthetic rating${json.created !== 1 ? 's' : ''}. Refresh the product page to see them.`,
      })
    } catch (err: unknown) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
          <Star className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-bold text-brand-black text-sm">Rating Generator</h3>
          <p className="text-xs text-gray-400">
            {total.toLocaleString()} synthetic rating{total !== 1 ? 's' : ''}
            {avg > 0 ? ` · avg ${avg.toFixed(1)}★` : ''}
          </p>
        </div>
      </div>

      {/* Per-star rows */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviews per star</p>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const pct = total > 0 ? Math.round((counts[star] / total) * 100) : 0
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12 flex items-center gap-1 flex-shrink-0">
                {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#FF90E8] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
              <input
                type="number"
                min="0"
                max="10000"
                value={counts[star]}
                onChange={(e) => setStarCount(star, e.target.value)}
                className="w-20 h-8 px-2 text-sm text-right rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF007A]/30 focus:border-[#FF007A]"
              />
            </div>
          )
        })}
      </div>

      {/* Total summary */}
      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
        <span className="text-gray-500">Total</span>
        <span className="font-bold text-brand-black">
          {total.toLocaleString()} rating{total !== 1 ? 's' : ''}
          {avg > 0 ? ` · ${avg.toFixed(1)}★` : ''}
        </span>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`text-sm rounded-xl px-4 py-3 ${
            result.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#FF007A] text-white font-bold rounded-xl hover:bg-[#e0006b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Star className="w-4 h-4" />
        )}
        {loading ? 'Saving…' : 'Save ratings'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Sets synthetic ratings only. Real buyer reviews are untouched.
      </p>
    </div>
  )
}
