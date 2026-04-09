import ProductCard from './ProductCard'
import type { ProductWithSeller } from '@/types/database'

interface ProductGridProps {
  products: (ProductWithSeller & { avg_rating?: number; review_count?: number })[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
