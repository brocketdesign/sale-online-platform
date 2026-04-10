import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { admin } = auth

  const { data, error } = await admin
    .from('reviews')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { userId, admin } = auth

  const body = await request.json()
  const { rating, title, body: reviewBody, verified_buyer, reviewer_id } = body

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 })
  }

  // Verify the product belongs to the authenticated user
  const { data: product } = await admin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('seller_id', userId)
    .maybeSingle()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data, error } = await admin
    .from('reviews')
    .insert({
      product_id: id,
      reviewer_id: reviewer_id ?? null,
      rating: Number(rating),
      title: title ?? null,
      body: reviewBody ?? null,
      verified_buyer: verified_buyer ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
