import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Download } from 'lucide-react'
import PDFViewer from '@/components/products/PDFViewer'

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
  const title = (data?.product as { title?: string } | null)?.title ?? 'Reader'
  return { title }
}

export default async function PDFReadPage({ params }: Props) {
  const { purchaseId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type PurchaseWithProduct = {
    id: string
    buyer_id: string | null
    buyer_email: string
    product: {
      id: string
      title: string
      seller_id: string
    } | null
  }

  const { data: purchaseRaw } = await supabase
    .from('purchases')
    .select(`
      id,
      buyer_id,
      buyer_email,
      product:products (
        id,
        title,
        seller_id
      )
    `)
    .eq('id', purchaseId)
    .maybeSingle()

  const purchase = purchaseRaw as unknown as PurchaseWithProduct | null
  if (!purchase || !purchase.product) notFound()

  const product = purchase.product
  const isBuyer = purchase.buyer_id === user.id || purchase.buyer_email === user.email
  const isSeller = product.seller_id === user.id

  if (!isBuyer && !isSeller) notFound()

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4 z-10">
        <Link
          href={`/library/${purchaseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-magenta transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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

      {/* Full-height PDF viewer */}
      <div className="flex-1 overflow-hidden">
        <PDFViewer purchaseId={purchaseId} />
      </div>
    </div>
  )
}
