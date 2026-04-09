import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/products/ProductFilters'
import SubscribeButton from '@/components/products/SubscribeButton'
import type { ProductWithSeller } from '@/types/database'

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{
    q?: string
    sort?: string
    tags?: string
    format?: string
    min_price?: string
    max_price?: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  return {
    title: `${username}'s store`,
    description: `Digital products by ${username}`,
  }
}

export default async function SellerStorePage({ params, searchParams }: PageProps) {
  const { username } = await params
  const sp = await searchParams

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  let query = supabase
    .from('products')
    .select(`*, profiles (id, username, display_name, avatar_url), reviews (rating)`)
    .eq('seller_id', profile.id)
    .eq('status', 'published')

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)
  if (sp.tags) query = query.overlaps('tags', sp.tags.split(',').filter(Boolean))
  if (sp.format) query = query.in('product_format', sp.format.split(',').filter(Boolean) as import('@/types/database').ProductFormat[])
  if (sp.min_price) query = query.gte('price', parseInt(sp.min_price) * 100)
  if (sp.max_price) query = query.lte('price', parseInt(sp.max_price) * 100)

  const sort = sp.sort ?? 'newest'
  if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'popular') query = query.order('sales_count', { ascending: false })

  const { data: rawProducts } = await query.limit(60)
  const products = (rawProducts ?? []).map((p: any) => {
    const reviews = (p.reviews as { rating: number }[]) ?? []
    const avg = reviews.length ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length : 0
    return { ...p, avg_rating: avg, review_count: reviews.length }
  }) as (ProductWithSeller & { avg_rating: number; review_count: number })[]

  // Collect all tags from ALL seller products for the filter
  const { data: allProductsForTags } = await supabase
    .from('products')
    .select('tags')
    .eq('seller_id', profile.id)
    .eq('status', 'published')
  const allTags = [...new Set((allProductsForTags ?? []).flatMap((p: { tags: string[] }) => p.tags))].slice(0, 30)

  return (
    <div className="min-h-screen bg-white">
      {/* Profile header */}
      <div className="bg-[#f4f0e8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  width={72}
                  height={72}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-brand-black text-white text-2xl font-black flex items-center justify-center">
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-brand-black">
                {profile.display_name || profile.username}
              </h1>
              {profile.tagline && (
                <p className="text-gray-600 mt-1 text-lg">{profile.tagline}</p>
              )}
              {profile.bio && (
                <p className="text-gray-500 mt-2 text-sm max-w-xl">{profile.bio}</p>
              )}
              <div className="mt-4">
                <SubscribeButton sellerId={profile.id} sellerName={profile.display_name || profile.username} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24">
              <Suspense>
                <ProductFilters totalCount={products.length} availableTags={allTags} />
              </Suspense>
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  )
}
