import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/testimonials?productId=xxx  — public, lists active testimonials
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_testimonials')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/testimonials  — seller creates a testimonial
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    product_id,
    sender_name,
    sender_avatar_url,
    message,
    display_time,
    display_date,
    reactions,
    likes_count,
    background_url,
    chat_bg_color,
    sort_order,
  } = body

  if (!product_id || !message) {
    return NextResponse.json({ error: 'product_id and message are required' }, { status: 400 })
  }

  // Verify seller owns the product
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', product_id)
    .eq('seller_id', user.id)
    .maybeSingle()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('chat_testimonials')
    .insert({
      product_id,
      seller_id: user.id,
      sender_name: sender_name ?? 'Happy Customer',
      sender_avatar_url: sender_avatar_url ?? null,
      message,
      display_time: display_time ?? '09:41',
      display_date: display_date ?? 'Today',
      reactions: reactions ?? [],
      likes_count: likes_count ?? 0,
      background_url: background_url ?? null,
      chat_bg_color: chat_bg_color ?? '#ECE5DD',
      sort_order: sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
