import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function randomPastDate(): string {
  const now = Date.now()
  const oneYearMs = 365 * 24 * 60 * 60 * 1000
  return new Date(now - Math.floor(Math.random() * oneYearMs)).toISOString()
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json() as { productId: string; distribution: Record<string, number> }
  const { productId, distribution } = body

  if (!productId || !distribution || typeof distribution !== 'object') {
    return NextResponse.json({ error: 'Missing productId or distribution' }, { status: 400 })
  }

  // Validate each star/count entry
  for (const [star, count] of Object.entries(distribution)) {
    const s = Number(star)
    if (s < 1 || s > 5 || !Number.isInteger(s)) {
      return NextResponse.json({ error: `Invalid star value: ${star}` }, { status: 400 })
    }
    if (!Number.isInteger(count) || count < 0 || count > 10000) {
      return NextResponse.json({ error: 'Count must be an integer between 0 and 10000' }, { status: 400 })
    }
  }

  // Delete all existing synthetic ratings for this product (reviewer_id IS NULL)
  const { error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .eq('product_id', productId)
    .is('reviewer_id', null)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Build rows for each star level
  const rows: Array<{
    product_id: string
    reviewer_id: null
    rating: number
    title: null
    body: null
    verified_buyer: boolean
    created_at: string
  }> = []

  for (const [star, count] of Object.entries(distribution)) {
    if (count <= 0) continue
    const s = Number(star)
    for (let i = 0; i < count; i++) {
      rows.push({
        product_id: productId,
        reviewer_id: null,
        rating: s,
        title: null,
        body: null,
        verified_buyer: false,
        created_at: randomPastDate(),
      })
    }
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from('reviews').insert(rows)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ created: rows.length })
}
