import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  comment?: string | null
  reviewer_id?: string | null
  buyer_id?: string | null
  created_at: string
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {(review.reviewer_id ?? review.buyer_id)?.slice(0, 2).toUpperCase() ?? 'AN'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium">Verified buyer</span>
              </div>
              {review.title && (
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{review.title}</p>
              )}
              {(review.body ?? review.comment) && (
                <p className="text-sm text-gray-700 leading-relaxed">{review.body ?? review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
