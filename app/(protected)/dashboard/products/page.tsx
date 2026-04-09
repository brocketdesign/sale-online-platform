import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
import DeleteProductButton from '@/components/dashboard/DeleteProductButton'
import PublishToggle from '@/components/dashboard/PublishToggle'

export default async function ProductsListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-brand-black">My Products</h1>
            <p className="text-gray-500 mt-1">{(products ?? []).length} total</p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New product
          </Link>
        </div>

        {(!products || products.length === 0) ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No products yet</h2>
            <p className="text-gray-400 mb-6">Create your first digital product to start selling.</p>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e]"
            >
              <Plus className="w-4 h-4" />
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Sales</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-black">{product.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{product.product_format.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-gray-700">{product.sales_count}</td>
                    <td className="px-6 py-4">
                      <PublishToggle productId={product.id} status={product.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {profile && (
                          <Link
                            href={`/${profile.username}/${product.slug}`}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
