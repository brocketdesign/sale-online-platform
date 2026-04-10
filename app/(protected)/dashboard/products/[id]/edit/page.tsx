import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductEditor from '@/components/dashboard/ProductEditor'
import RatingGeneratorDashboard from '@/components/dashboard/RatingGeneratorDashboard'
import type { Product } from '@/types/database'

export const metadata = { title: 'Edit Product' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: product } = await supabase
    .from('products')
    .select('*, profiles(username)')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (!product) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

  // Fetch per-star counts for synthetic reviews (reviewer_id IS NULL)
  const { data: syntheticReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', id)
    .is('reviewer_id', null)

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of syntheticReviews ?? []) {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating as 1 | 2 | 3 | 4 | 5]++
    }
  }

  const sellerUsername = (product as any).profiles?.username as string | null
  const productUrl = sellerUsername && product.slug ? `/${sellerUsername}/${product.slug}` : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update your product details below.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {productUrl && product.status === 'published' && (
            <Link
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Product
            </Link>
          )}
          {isAdmin && (
          <Link
            href={`/dashboard/products/${id}/testimonials`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] font-semibold rounded-xl hover:bg-[#dcfce7] transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Screenshot Testimonials
          </Link>
          )}
        </div>
      </div>

      {/* Two-column layout: editor | rating generator */}
      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <ProductEditor mode="edit" product={product as Product} sellerId={user.id} isAdmin={isAdmin} />
        </div>
        {isAdmin && (
        <div className="w-80 flex-shrink-0 sticky top-8">
          <RatingGeneratorDashboard productId={id} initialCounts={starCounts} />
        </div>
        )}
      </div>
    </div>
  )
}
