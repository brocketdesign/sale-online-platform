import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductEditor from '@/components/dashboard/ProductEditor'

export const metadata = { title: 'New Product' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">Create New Product</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to publish your digital product.</p>
      </div>
      <ProductEditor mode="create" sellerId={user.id} />
    </div>
  )
}
