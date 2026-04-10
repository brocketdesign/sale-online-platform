import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, admin } = auth
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100)
  const page = Math.max(Number(searchParams.get('page') ?? '1'), 1)
  const offset = (page - 1) * limit

  // Collect product IDs for this seller
  const { data: products } = await admin
    .from('products')
    .select('id')
    .eq('seller_id', userId)

  const productIds = (products ?? []).map((p: { id: string }) => p.id)

  if (productIds.length === 0) {
    return NextResponse.json({ data: [], total: 0, page, limit })
  }

  // Find orders that contain at least one of the seller's products
  const { data: orderItems } = await admin
    .from('order_items')
    .select('order_id')
    .in('product_id', productIds)

  const orderIds = [...new Set((orderItems ?? []).map((oi: { order_id: string }) => oi.order_id))]

  if (orderIds.length === 0) {
    return NextResponse.json({ data: [], total: 0, page, limit })
  }

  const { data, error, count } = await admin
    .from('orders')
    .select('*, order_items(unit_price, quantity, products(id, title, slug))', { count: 'exact' })
    .in('id', orderIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count, page, limit })
}
