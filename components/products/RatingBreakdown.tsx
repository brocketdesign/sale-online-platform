import { Star } from 'lucide-react'

interface Review {
  rating: number
}

interface Props {
  reviews: Review[]
  avg: number
}

export default function RatingBreakdown({ reviews, avg }: Props) {
  const total = reviews.length
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }))

  return (
    <div className="flex gap-8 items-start">
      {/* Overall */}
      <div className="text-center flex-shrink-0">
        <div className="text-6xl font-black text-brand-black">{avg.toFixed(1)}</div>
        <div className="flex justify-center mt-1 mb-1 gap-0.5">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
          ))}
        </div>
        <div className="text-xs text-gray-500">{total.toLocaleString()} rating{total !== 1 ? 's' : ''}</div>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-2">
        {counts.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-10 flex items-center gap-1 flex-shrink-0">
              {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-[#FF90E8] rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
