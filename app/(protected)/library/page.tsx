import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { BookOpen, Download, Star } from 'lucide-react'

export const metadata = { title: 'My Library' }

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type PurchaseWithProduct = {
    id: string
    created_at: string
    amount_paid: number
    currency: string
    product: {
      id: string
      title: string
      slug: string
      banner_url: string | null
      product_format: string
      seller: { username: string; display_name: string | null } | null
    } | null
  }

  const { data: purchasesRaw } = await supabase
    .from('purchases')
    .select(`
      id,
      created_at,
      amount_paid,
      currency,
      product:products (
        id,
        title,
        slug,
        banner_url,
        product_format,
        seller:profiles!products_seller_id_fkey (
          username,
          display_name
        )
      )
    `)
    .or(`buyer_id.eq.${user.id},buyer_email.eq.${user.email}`)
    .order('created_at', { ascending: false })

  const purchases = (purchasesRaw ?? []) as unknown as PurchaseWithProduct[]

  // Fetch which products have already been reviewed by this user
  const productIds = purchases.map(p => p.product?.id).filter(Boolean) as string[]
  const { data: reviewsRaw } = productIds.length
    ? await supabase
        .from('reviews')
        .select('product_id')
        .eq('reviewer_id', user.id)
        .in('product_id', productIds)
    : { data: [] }

  const reviewedProductIds = new Set((reviewsRaw ?? []).map(r => r.product_id))

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-black">My Library</h1>
          <p className="text-gray-500 mt-1">
            {purchases.length} product{purchases.length !== 1 ? 's' : ''}
          </p>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Your library is empty.</p>
            <p className="text-gray-400 text-sm mb-6">Products you purchase will appear here. If you&apos;re a seller, manage your products from the <Link href="/dashboard/products" className="text-brand-magenta hover:underline">dashboard</Link>.</p>
            <Link href="/discover">
              <span className="text-brand-magenta font-medium hover:underline">Browse products →</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {purchases.map(purchase => {
              const product = purchase.product
              if (!product) return null

              const purchasedAt = new Date(purchase.created_at).getTime()
              const reviewUnlocked = Date.now() - purchasedAt >= THREE_DAYS_MS
              const alreadyReviewed = reviewedProductIds.has(product.id)

              const reviewUnlockDate = new Date(purchasedAt + THREE_DAYS_MS).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })

              return (
                <div key={purchase.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                  {product.banner_url && (
                    <div className="aspect-[16/7] bg-gray-100 relative">
                      <img
                        src={product.banner_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs text-gray-400 mb-1 capitalize">{product.product_format}</div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                    <div className="text-xs text-gray-500 mb-4">
                      by{' '}
                      <Link
                        href={`/${product.seller?.username}`}
                        className="hover:text-brand-magenta"
                      >
                        {product.seller?.display_name ?? product.seller?.username}
                      </Link>
                    </div>

                    {/* Review status badge */}
                    <div className="mb-3">
                      {alreadyReviewed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
                          <Star className="w-3 h-3 fill-green-500" /> Reviewed
                        </span>
                      ) : reviewUnlocked ? (
                        <Link
                          href={`/library/${purchase.id}#review`}
                          className="inline-flex items-center gap-1 text-xs text-brand-magenta bg-pink-50 border border-pink-100 rounded-full px-2.5 py-1 hover:bg-pink-100 transition-colors"
                        >
                          <Star className="w-3 h-3" /> Leave a review
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                          <Star className="w-3 h-3" /> Review unlocks {reviewUnlockDate}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">
                        {formatPrice(purchase.amount_paid, purchase.currency)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/library/${purchase.id}/read`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-black text-white text-sm font-medium rounded-xl hover:bg-brand-black/80 transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          Read
                        </Link>
                        <a
                          href={`/api/download/${purchase.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-magenta text-white text-sm font-medium rounded-xl hover:bg-brand-magenta/90 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

