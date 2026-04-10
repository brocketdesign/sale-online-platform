import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Package, DollarSign, ShoppingBag, TrendingUp, UserCircle, Key, BookOpen } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const { data: products } = await supabase
    .from('products')
    .select('id, status, price, sales_count, title')
    .eq('seller_id', user.id)

  const productIds = (products ?? []).map((p: { id: string }) => p.id)

  const { data: orderItems } = productIds.length > 0
    ? await supabase
        .from('order_items')
        .select('product_id, unit_price, quantity')
        .in('product_id', productIds)
    : { data: [] as Array<{ product_id: string; unit_price: number; quantity: number }> }

  // Real revenue and per-product real sales count from actual orders
  const realOrdersByProduct = (orderItems ?? []).reduce<Record<string, { revenue: number; count: number }>>(
    (acc, o) => {
      if (!o.product_id) return acc
      if (!acc[o.product_id]) acc[o.product_id] = { revenue: 0, count: 0 }
      acc[o.product_id].revenue += o.unit_price * o.quantity
      acc[o.product_id].count += o.quantity
      return acc
    },
    {}
  )

  // Compute total revenue including placeholder sales (at product price)
  let totalRevenue = 0
  for (const product of (products ?? [])) {
    const real = realOrdersByProduct[product.id] ?? { revenue: 0, count: 0 }
    const placeholderCount = Math.max(0, (product.sales_count ?? 0) - real.count)
    totalRevenue += real.revenue + placeholderCount * product.price
  }

  const publishedCount = (products ?? []).filter((p: { status: string }) => p.status === 'published').length
  const totalSales = (products ?? []).reduce((s: number, p: { sales_count: number }) => s + (p.sales_count ?? 0), 0)

  const stats = [
    { label: 'Total revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Products', value: String((products ?? []).length), sub: `${publishedCount} published`, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total sales', value: String(totalSales), icon: ShoppingBag, color: 'bg-[#FF90E8]/10 text-[#FF007A]' },
    { label: 'Avg. sale value', value: totalSales > 0 ? formatPrice(Math.round(totalRevenue / totalSales)) : '$0', icon: TrendingUp, color: 'bg-yellow-50 text-yellow-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-brand-black">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {profile?.display_name || profile?.username || user.email}
            </p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] transition-colors shadow-sm"
          >
            + New product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-brand-black">{s.value}</div>
              {s.sub && <div className="text-xs text-gray-400 mt-1">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/dashboard/products" className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <Package className="w-7 h-7 text-blue-500 mb-3" />
            <h3 className="font-bold text-brand-black mb-1">My Products</h3>
            <p className="text-sm text-gray-400">Manage, edit or create products</p>
            <span className="text-sm text-[#FF007A] font-semibold mt-3 block group-hover:underline">Manage →</span>
          </Link>
          <Link href="/dashboard/orders" className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <ShoppingBag className="w-7 h-7 text-[#FF007A] mb-3" />
            <h3 className="font-bold text-brand-black mb-1">Orders</h3>
            <p className="text-sm text-gray-400">View your sales history</p>
            <span className="text-sm text-[#FF007A] font-semibold mt-3 block group-hover:underline">View orders →</span>
          </Link>
          {profile && (
            <Link href={`/${profile.username}`} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <TrendingUp className="w-7 h-7 text-green-500 mb-3" />
              <h3 className="font-bold text-brand-black mb-1">My Store</h3>
              <p className="text-sm text-gray-400">See your public store page</p>
              <span className="text-sm text-[#FF007A] font-semibold mt-3 block group-hover:underline">Visit store →</span>
            </Link>
          )}
          <Link href="/dashboard/profile" className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <UserCircle className="w-7 h-7 text-purple-500 mb-3" />
            <h3 className="font-bold text-brand-black mb-1">Profile &amp; Security</h3>
            <p className="text-sm text-gray-400">Update your name, avatar &amp; password</p>
            <span className="text-sm text-[#FF007A] font-semibold mt-3 block group-hover:underline">Edit profile →</span>
          </Link>
          <Link href="/dashboard/api-keys" className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <Key className="w-7 h-7 text-[#FF007A] mb-3" />
            <h3 className="font-bold text-brand-black mb-1">API Keys</h3>
            <p className="text-sm text-gray-400">Create &amp; manage keys for external integrations</p>
            <span className="text-sm text-[#FF007A] font-semibold mt-3 block group-hover:underline">Manage keys →</span>
          </Link>
          <Link href="/dashboard/api-docs" className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <BookOpen className="w-7 h-7 text-blue-500 mb-3" />
            <h3 className="font-bold text-brand-black mb-1">API Docs</h3>
            <p className="text-sm text-gray-400">Reference for all REST endpoints &amp; agent usage</p>
            <span className="text-sm text-[#FF007A] font-semibold mt-3 block group-hover:underline">View docs →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
