import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import LibraryReviewSection from '@/components/products/LibraryReviewSection'

interface Props {
  params: Promise<{ purchaseId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { purchaseId } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('purchases')
    .select('product:products(title)')
    .eq('id', purchaseId)
    .maybeSingle()
  const title = (data?.product as { title?: string } | null)?.title ?? 'Reading'
  return { title }
}

export default async function LibraryReaderPage({ params }: Props) {
  const { purchaseId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type PurchaseWithDetails = {
    id: string
    created_at: string
    product: {
      id: string
      title: string
      description: string | null
      banner_url: string | null
      product_format: string
      seller: { username: string; display_name: string | null } | null
    } | null
  }

  const { data: purchaseRaw } = await supabase
    .from('purchases')
    .select(`
      id,
      created_at,
      product:products (
        id,
        title,
        description,
        banner_url,
        product_format,
        seller:profiles!products_seller_id_fkey (
          username,
          display_name
        )
      )
    `)
    .eq('id', purchaseId)
    .eq('buyer_id', user.id)
    .maybeSingle()

  const purchase = purchaseRaw as unknown as PurchaseWithDetails | null
  if (!purchase || !purchase.product) notFound()

  const product = purchase.product

  // Check if user already reviewed this product
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', product.id)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-magenta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Library
          </Link>
          <span className="font-semibold text-gray-800 truncate text-sm">{product.title}</span>
          <a
            href={`/api/download/${purchaseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-magenta text-white text-xs font-medium rounded-lg hover:bg-brand-magenta/90 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Banner */}
        {product.banner_url && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img
              src={product.banner_url}
              alt={product.title}
              className="w-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-brand-magenta uppercase tracking-wide mb-2 capitalize">
            {product.product_format}
          </div>
          <h1 className="text-3xl font-bold text-brand-black mb-2">{product.title}</h1>
          {product.seller && (
            <p className="text-gray-500 text-sm">
              by{' '}
              <Link
                href={`/${product.seller.username}`}
                className="hover:text-brand-magenta transition-colors"
              >
                {product.seller.display_name ?? product.seller.username}
              </Link>
            </p>
          )}
        </div>

        {/* E-book content */}
        <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-brand-magenta prose-img:rounded-xl">
          {product.description ? (
            <ReactMarkdown>{product.description}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">
              No preview content available. Please download the file to read the full content.
            </p>
          )}
        </article>

        {/* Review section — unlocks after 3 days + scroll */}
        <LibraryReviewSection
          purchaseId={purchaseId}
          purchasedAt={purchase.created_at}
          productId={product.id}
          reviewAlreadySubmitted={!!existingReview}
        />
      </div>
    </div>
  )
}
