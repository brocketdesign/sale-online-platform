import { Star, StarHalf } from 'lucide-react'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export default function StarRating({ rating, count, size = 'md', showCount = true }: StarRatingProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  const cls = sizes[size]

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${cls} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className={`${textSizes[size]} text-gray-500`}>
          {rating.toFixed(1)} ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}
