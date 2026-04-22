import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithSeller } from '@/types/database'
import StarRating from './StarRating'
import PriceTag from './PriceTag'
import { FILE_FORMAT_LABELS } from '@/lib/utils'

interface ProductCardProps {
  product: ProductWithSeller & { avg_rating?: number; review_count?: number }
}

export default function ProductCard({ product }: ProductCardProps) {
  const href = `/${product.profiles.username}/${product.slug}`
  const rating = product.avg_rating ?? 0
  const count = product.review_count ?? 0

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 active:scale-[0.98] active:shadow-none transition-all duration-150 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {product.banner_url ? (
            <Image
              src={product.banner_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF90E8]/30 to-[#FF007A]/20 flex items-center justify-center">
              <span className="text-4xl font-black text-[#FF007A]/40">
                {product.title.charAt(0)}
              </span>
            </div>
          )}
          {/* Format badge */}
          <div className="absolute top-2 right-2">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full text-gray-600 shadow-sm">
              {FILE_FORMAT_LABELS[product.product_format] ?? product.product_format}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-brand-black text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#FF007A] transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{product.profiles.display_name || product.profiles.username}</p>

          {count > 0 && (
            <div className="mb-3">
              <StarRating rating={rating} count={count} size="sm" />
            </div>
          )}

          <PriceTag price={product.price} currency={product.currency} />
        </div>
      </div>
    </Link>
  )
}
