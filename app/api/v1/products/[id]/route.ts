import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import type { Database } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { userId, admin } = auth

  const { data, error } = await admin
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('seller_id', userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { userId, admin } = auth

  const { data: existing } = await admin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('seller_id', userId)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const allowed = [
    'title', 'slug', 'description', 'price', 'currency', 'status',
    'tags', 'product_format', 'conversion_message', 'banner_url', 'show_sales_count',
  ]
  const updates: Database['public']['Tables']['products']['Update'] = {}
  for (const key of allowed) {
    if (key in body) (updates as Record<string, unknown>)[key] = body[key]
  }

  const { data, error } = await admin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { userId, admin } = auth

  const { data: existing } = await admin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('seller_id', userId)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Product deleted' })
}
