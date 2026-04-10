import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: { productId?: string; rating?: number; title?: string; body?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { productId, rating, title, body: reviewBody } = body

  if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
  }
  if (!title || title.length < 3 || title.length > 100) {
    return NextResponse.json({ error: 'Title must be 3–100 characters' }, { status: 400 })
  }
  if (!reviewBody || reviewBody.length < 10 || reviewBody.length > 2000) {
    return NextResponse.json({ error: 'Review must be 10–2000 characters' }, { status: 400 })
  }

  // Verify purchase and 3-day rule
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id, created_at')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .maybeSingle()

  if (!purchase) {
    return NextResponse.json({ error: 'You must purchase this product before reviewing it' }, { status: 403 })
  }

  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
  const purchasedAt = new Date(purchase.created_at).getTime()
  if (Date.now() - purchasedAt < THREE_DAYS_MS) {
    return NextResponse.json({ error: 'Reviews unlock 3 days after purchase' }, { status: 403 })
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    reviewer_id: user.id,
    rating,
    title,
    body: reviewBody,
    verified_buyer: true,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
