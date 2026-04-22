import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/affiliates/track
 * Body: { code: string }
 * Increments the click count for the given affiliate link code.
 */
export async function POST(request: Request) {
  try {
    const { code } = await request.json() as { code?: string }
    if (!code || typeof code !== 'string' || !/^[a-z0-9]{6,16}$/.test(code)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = createServiceClient()
    await supabase.rpc('increment_affiliate_clicks', { link_code: code })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
