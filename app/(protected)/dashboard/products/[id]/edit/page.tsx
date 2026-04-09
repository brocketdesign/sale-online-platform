import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductEditor from '@/components/dashboard/ProductEditor'
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
    .select('*')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (!product) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update your product details below.</p>
        </div>
        <Link
          href={`/dashboard/products/${id}/testimonials`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] font-semibold rounded-xl hover:bg-[#dcfce7] transition-colors text-sm flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          Screenshot Testimonials
        </Link>
      </div>
      <ProductEditor mode="edit" product={product as Product} sellerId={user.id} />
    </div>
  )
}
