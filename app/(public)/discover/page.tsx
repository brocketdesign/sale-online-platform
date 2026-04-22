import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/products/ProductFilters'
import type { ProductWithSeller } from '@/types/database'

interface PageProps {
  searchParams: Promise<{
    q?: string
    sort?: string
    tags?: string
    format?: string
    min_price?: string
    max_price?: string
    language?: string
    currency?: string
  }>
}

async function getProducts(sp: Awaited<PageProps['searchParams']>) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      profiles (id, username, display_name, avatar_url),
      reviews (rating)
    `)
    .eq('status', 'published')

  if (sp.q) {
    query = query.ilike('title', `%${sp.q}%`)
  }

  if (sp.tags) {
    const tags = sp.tags.split(',').filter(Boolean)
    query = query.overlaps('tags', tags)
  }

  if (sp.format) {
    const formats = sp.format.split(',').filter(Boolean) as import('@/types/database').ProductFormat[]
    query = query.in('product_format', formats)
  }

  if (sp.min_price) {
    query = query.gte('price', parseInt(sp.min_price) * 100)
  }

  if (sp.max_price) {
    query = query.lte('price', parseInt(sp.max_price) * 100)
  }

  if (sp.language) {
    const languages = sp.language.split(',').filter(Boolean)
    query = query.in('page_language', languages)
  }

  if (sp.currency) {
    const currencies = sp.currency.split(',').filter(Boolean)
    query = query.in('currency', currencies)
  }

  const sort = sp.sort ?? 'newest'
  if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'popular') query = query.order('sales_count', { ascending: false })

  const { data, error } = await query.limit(60)
  if (error) {
    console.error('[Discover] products query error:', error.message)
    return []
  }
  if (!data) return []

  return data.map((p: any) => {
    const reviews = (p.reviews as { rating: number }[]) ?? []
    const avg = reviews.length ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length : 0
    return { ...p, avg_rating: avg, review_count: reviews.length }
  }) as (ProductWithSeller & { avg_rating: number; review_count: number })[]
}

async function getAllTags() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('tags')
    .eq('status', 'published')
  const all = (data ?? []).flatMap((p: { tags: string[] }) => p.tags)
  return [...new Set(all)].slice(0, 30)
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const [products, allTags] = await Promise.all([getProducts(sp), getAllTags()])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-brand-black mb-2">Discover</h1>
          <p className="text-gray-500">Find digital products across every category.</p>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24">
              <Suspense>
                <ProductFilters totalCount={products.length} availableTags={allTags} />
              </Suspense>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading products...</div>}>
              <ProductGrid products={products} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
