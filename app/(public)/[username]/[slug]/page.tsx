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
import { getTranslations } from '@/lib/i18n'

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
  const t = getTranslations(product.page_language)

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

  // Fetch preview images if preview is enabled
  const previewImages: Array<{ id: string; image_url: string; sort_order: number }> = []
  if (product.preview_enabled) {
    const { data: previewImagesRaw } = await supabase
      .from('product_preview_images')
      .select('id, image_url, sort_order')
      .eq('product_id', product.id)
      .order('sort_order')
    previewImages.push(...(previewImagesRaw ?? []))
  }

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
            <span className="font-black text-lg text-brand-black">{formatPrice(product.price, product.currency)}</span>
            <AddToCartButton product={product} seller={profile} size="sm" lang={product.page_language} />
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

      {/* Mobile sticky bottom bar — mini product card */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.10)] px-3 py-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {product.banner_url && (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
              <Image src={product.banner_url} alt={product.title} width={56} height={56} className="w-full h-full object-cover" />
            </div>
          )}
          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-brand-black truncate leading-tight">{product.title}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {reviews.length > 0 && <StarRating rating={avg} count={reviews.length} size="sm" />}
              {product.show_sales_count && product.sales_count > 0 && (
                <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full leading-none">
                  {t.salesCount(product.sales_count)}
                </span>
              )}
            </div>
          </div>
          {/* Price + CTA */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            <span className="text-base font-black text-brand-black leading-none">{formatPrice(product.price, product.currency)}</span>
            <AddToCartButton product={product} seller={profile} size="sm" lang={product.page_language} />
          </div>
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

            {/* Page previews */}
            {product.preview_enabled && previewImages.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-black text-brand-black mb-2">{t.preview}</h2>
                <p className="text-sm text-gray-500 mb-5">
                  {product.preview_blur ? t.previewBlurSubtitle : t.previewSubtitle}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewImages.slice(0, product.preview_page_count).map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[3/4] shadow-sm"
                    >
                      <Image
                        src={img.image_url}
                        alt={`Preview page ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className={`object-cover w-full h-full transition-all${product.preview_blur ? ' blur-sm scale-105' : ''}`}
                      />
                      {product.preview_blur && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center shadow">
                            <svg className="w-5 h-5 text-gray-500 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <p className="text-xs font-semibold text-gray-600">{t.buyUnlock}</p>
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-0.5">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-black text-brand-black mb-6">{t.ratings}</h2>
                <RatingBreakdown reviews={reviews} avg={avg} />
              </div>
            )}

            {/* Screenshot testimonials */}
            {chatTestimonials.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-black text-brand-black">{t.verifiedReviews}</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-bold rounded-full">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    {t.verifiedBadge}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{t.verifiedReviewsSubtitle}</p>
                <div className="flex flex-wrap gap-5">
                  {chatTestimonials.map((testimonial) => (
                    <WhatsAppScreenshot
                      key={testimonial.id}
                      testimonial={testimonial}
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
                <span className="text-4xl font-black text-brand-black">{formatPrice(product.price, product.currency)}</span>
              </div>

              {/* Conversion message */}
              {product.conversion_message && (
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">{product.conversion_message}</p>
              )}

              <AddToCartButton product={product} seller={profile} lang={product.page_language} />

              {/* Sales count */}
              {product.show_sales_count && product.sales_count > 0 && (
                <div className="mt-3">
                  <LiveSalesBadge count={product.sales_count} />
                </div>
              )}

              {/* Wishlist + Share */}
              <div className="mt-3 flex gap-2">
                <WishlistButton productId={product.id} productTitle={product.title} lang={product.page_language} />
                <ShareButton title={product.title} />
              </div>

              {/* Ratings breakdown */}
              {reviews.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-brand-black mb-3 flex items-center justify-between">
                    {t.ratings}
                    <span className="text-sm font-semibold text-gray-500">
                      ★ {avg.toFixed(1)} ({reviews.length} {t.rating}{reviews.length !== 1 ? 's' : ''})
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
                {t.viewStore} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
