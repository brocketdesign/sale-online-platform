import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/database'

export const metadata = { title: 'Orders' }

const STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'default' | 'danger'> = {
  completed: 'success',
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'danger',
  disputed: 'danger',
}

export default async function DashboardOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch orders containing at least one product owned by this seller
  type OrderFetched = {
    id: string
    created_at: string
    status: string
    total_amount: number
    currency: string
    buyer_email: string
    buyer_name: string | null
    stripe_session_id: string
    order_items: Array<{
      id: string
      quantity: number
      unit_price: number
      product: { id: string; title: string; slug: string; seller_id: string } | null
    }>
  }

  const { data: ordersRaw } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total_amount,
      currency,
      buyer_email,
      buyer_name,
      stripe_session_id,
      order_items (
        id,
        quantity,
        unit_price,
        product:products (
          id,
          title,
          slug,
          seller_id
        )
      )
    `)
    .order('created_at', { ascending: false })

  const orders = (ordersRaw ?? []) as unknown as OrderFetched[]

  // Filter orders that include this seller's products
  const sellerOrders = orders.filter(order =>
    order.order_items.some(item => item.product?.seller_id === user.id)
  )

  // For each order, keep only this seller's items
  const filteredOrders = sellerOrders.map(order => ({
    ...order,
    order_items: order.order_items.filter(item => item.product?.seller_id === user.id),
    seller_revenue: order.order_items
      .filter(item => item.product?.seller_id === user.id)
      .reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Orders</h1>
          <p className="text-gray-500 mt-1">{filteredOrders.length} orders</p>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No orders yet.</p>
          <p className="text-sm mt-1">When customers purchase your products, orders will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Products</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.buyer_name || '—'}</div>
                      <div className="text-gray-400 text-xs">{order.buyer_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="text-gray-700">
                            {item.product?.title ?? 'Unknown product'}
                            {item.quantity > 1 && (
                              <span className="text-gray-400 ml-1">×{item.quantity}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-black">
                      {formatPrice(order.seller_revenue, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[order.status as OrderStatus] ?? 'default'}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
