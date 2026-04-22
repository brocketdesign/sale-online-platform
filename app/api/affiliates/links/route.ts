import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function generateCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * GET /api/affiliates/links?product_id=xxx
 * Returns the affiliate link for the current user and the given product,
 * or all links for the user if no product_id is provided.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')

  let query = supabase
    .from('affiliate_links')
    .select(`
      id, code, clicks, created_at,
      products (id, title, slug, price, currency, affiliate_commission_rate, banner_url,
        profiles!products_seller_id_fkey (username, display_name))
    `)
    .eq('affiliate_id', user.id)
    .order('created_at', { ascending: false })

  if (productId) {
    query = query.eq('product_id', productId) as typeof query
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ links: data ?? [] })
}

/**
 * POST /api/affiliates/links
 * Body: { product_id: string }
 * Creates (or returns existing) affiliate link for the current user and product.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { product_id } = body as { product_id: string }
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  // Check product exists and has affiliate enabled
  const { data: product } = await supabase
    .from('products')
    .select('id, seller_id, affiliate_enabled, affiliate_commission_rate')
    .eq('id', product_id)
    .maybeSingle()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (!product.affiliate_enabled) return NextResponse.json({ error: 'Affiliate program not enabled for this product' }, { status: 403 })
  if (product.seller_id === user.id) return NextResponse.json({ error: 'You cannot affiliate your own product' }, { status: 403 })

  // Check if link already exists
  const { data: existing } = await supabase
    .from('affiliate_links')
    .select('id, code')
    .eq('product_id', product_id)
    .eq('affiliate_id', user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ code: existing.code, id: existing.id, created: false })

  // Generate unique code
  const serviceClient = createServiceClient()
  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: conflict } = await serviceClient
      .from('affiliate_links')
      .select('id')
      .eq('code', code)
      .maybeSingle()
    if (!conflict) break
    code = generateCode()
    attempts++
  }

  const { data: link, error } = await serviceClient
    .from('affiliate_links')
    .insert({ product_id, affiliate_id: user.id, code })
    .select('id, code')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code: link.code, id: link.id, created: true })
}

/**
 * DELETE /api/affiliates/links?id=xxx
 * Deletes an affiliate link owned by the current user.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('affiliate_links')
    .delete()
    .eq('id', id)
    .eq('affiliate_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
