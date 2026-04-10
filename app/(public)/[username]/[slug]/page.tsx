import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import StarRating from '@/components/products/StarRating'
import PriceTag from '@/components/products/PriceTag'
import AddToCartButton from '@/components/products/AddToCartButton'
import RatingBreakdown from '@/components/products/RatingBreakdown'
import ProductDescription from '@/components/products/ProductDescription'
import LiveSalesBadge from '@/components/products/LiveSalesBadge'
import WishlistButton from '@/components/products/WishlistButton'
import ShareButton from '@/components/products/ShareButton'
import WhatsAppScreenshot from '@/components/testimonials/WhatsAppScreenshot'
import type { ChatTestimonial } from '@/components/testimonials/WhatsAppScreenshot'
import { formatPrice } from '@/lib/utils'

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle()
  if (!profile) return {}
  const { data: product } = await supabase.from('products').select('title').eq('seller_id', profile.id).eq('slug', slug).maybeSingle()
  return { title: product?.title ?? slug }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const { data: productRaw } = await supabase
    .from('products')
    .select(`*, profiles (*)`)
    .eq('seller_id', profile.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!productRaw) notFound()

  const product = productRaw as any

  const { data: reviewsRaw } = await supabase
    .from('reviews')
    .select('id, rating, title, body, reviewer_id, created_at')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  const reviews = (reviewsRaw ?? []) as Array<{ id: string; rating: number; title: string | null; body: string | null; reviewer_id: string | null; created_at: string }>
  const avg = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0

  const { data: testimonialsRaw } = await supabase
    .from('chat_testimonials')
    .select('*')
    .eq('product_id', product.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const chatTestimonials = (testimonialsRaw ?? []) as ChatTestimonial[]

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top bar (shown by CSS on scroll via JS below) */}
      <div id="sticky-bar" className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <span className="font-bold text-brand-black text-sm truncate max-w-xs">{product.title}</span>
            {reviews.length > 0 && <StarRating rating={avg} count={reviews.length} size="sm" />}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-black text-lg text-brand-black">{formatPrice(product.price)}</span>
            <AddToCartButton product={product} seller={profile} size="sm" />
          </div>
        </div>
      </div>

      {/* Banner */}
      {product.banner_url && (
        <div className="w-full bg-gray-100">
          <Image
            src={product.banner_url}
            alt={product.title}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto"
            priority
          />
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="flex lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] px-4 py-3 gap-4 items-center">
        <div className="flex flex-col">
          <span className="text-xl font-black text-brand-black leading-none">{formatPrice(product.price)}</span>
          {product.conversion_message && (
            <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.conversion_message}</span>
          )}
        </div>
        <div className="flex-1">
          <AddToCartButton product={product} seller={profile} />
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 lg:pb-10">
        <div className="flex gap-10 items-start">
          {/* Left: content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <h1 className="text-4xl font-black text-brand-black mb-4">{product.title}</h1>

            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.display_name || profile.username} width={36} height={36} className="rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-black text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
              <Link href={`/${profile.username}`} className="font-semibold text-gray-700 hover:text-[#FF007A] transition-colors">
                {profile.display_name || profile.username}
              </Link>
            </div>

            {reviews.length > 0 && (
              <div className="mb-6">
                <StarRating rating={avg} count={reviews.length} size="md" />
              </div>
            )}

            {/* Description */}
            <div className="mb-10">
              <ProductDescription html={product.description ?? ''} />
            </div>

            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-black text-brand-black mb-6">Ratings</h2>
                <RatingBreakdown reviews={reviews} avg={avg} />
              </div>
            )}

            {/* Screenshot testimonials */}
            {chatTestimonials.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-black text-brand-black">Verified Reviews</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-bold rounded-full">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Verified
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Real messages from customers, shared with permission.</p>
                <div className="flex flex-wrap gap-5">
                  {chatTestimonials.map((t) => (
                    <WhatsAppScreenshot
                      key={t.id}
                      testimonial={t}
                      sellerName={profile.display_name ?? profile.username}
                      sellerAvatarUrl={profile.avatar_url ?? null}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: purchase sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-32">
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-brand-black">{formatPrice(product.price)}</span>
              </div>

              {/* Conversion message */}
              {product.conversion_message && (
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">{product.conversion_message}</p>
              )}

              <AddToCartButton product={product} seller={profile} />

              {/* Sales count */}
              {product.show_sales_count && product.sales_count > 0 && (
                <div className="mt-3">
                  <LiveSalesBadge count={product.sales_count} />
                </div>
              )}

              {/* Wishlist + Share */}
              <div className="mt-3 flex gap-2">
                <WishlistButton productId={product.id} productTitle={product.title} />
                <ShareButton title={product.title} />
              </div>

              {/* Ratings breakdown */}
              {reviews.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-brand-black mb-3 flex items-center justify-between">
                    Ratings
                    <span className="text-sm font-semibold text-gray-500">
                      ★ {avg.toFixed(1)} ({reviews.length} rating{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <RatingBreakdown reviews={reviews} avg={avg} compact />
                </div>
              )}
            </div>

            {/* Creator card */}
            <div className="mt-4 bg-[#f4f0e8] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.display_name || profile.username} width={44} height={44} className="rounded-full object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand-black text-white text-base font-bold flex items-center justify-center flex-shrink-0">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm text-brand-black">{profile.display_name || profile.username}</div>
                  {profile.tagline && <div className="text-xs text-gray-500">{profile.tagline}</div>}
                </div>
              </div>
              <Link href={`/${profile.username}`} className="text-sm text-[#FF007A] font-semibold hover:underline">
                View all products →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
