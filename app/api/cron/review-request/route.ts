import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendReviewRequestEmail } from '@/lib/resend'

// This endpoint is meant to be called by a cron job (e.g. Vercel Cron) once per hour.
// It finds all purchases that are ≥3 days old and have not yet received a review-request email,
// then sends the email and marks the record.
//
// Protect it with a shared secret in the Authorization header:
//   Authorization: Bearer <CRON_SECRET>

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()

  const THREE_DAYS_AGO = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  type PurchaseRow = {
    id: string
    buyer_email: string
    created_at: string
    product: {
      id: string
      title: string
      slug: string
      banner_url: string | null
      seller: { username: string; display_name: string | null } | null
    } | null
    profile: { display_name: string | null; full_name: string | null } | null
  }

  const { data: pendingRaw, error } = await supabase
    .from('purchases')
    .select(`
      id,
      buyer_email,
      created_at,
      product:products (
        id,
        title,
        slug,
        banner_url,
        seller:profiles!products_seller_id_fkey (
          username,
          display_name
        )
      ),
      profile:profiles!purchases_buyer_id_fkey (
        display_name
      )
    `)
    .lte('created_at', THREE_DAYS_AGO)
    .is('review_request_sent_at', null)
    .limit(50) // process in batches

  if (error) {
    console.error('[review-request cron] query error', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const pending = (pendingRaw ?? []) as unknown as PurchaseRow[]

  let sent = 0
  let failed = 0

  for (const purchase of pending) {
    if (!purchase.product || !purchase.buyer_email) {
      continue
    }

    const product = purchase.product
    const seller = product.seller
    const buyerName = (purchase.profile as { display_name?: string | null } | null)?.display_name ?? ''

    try {
      await sendReviewRequestEmail({
        to: purchase.buyer_email,
        buyerName,
        productTitle: product.title,
        productBannerUrl: product.banner_url,
        sellerName: seller?.display_name ?? seller?.username ?? 'the creator',
        productSlug: product.slug,
        sellerUsername: seller?.username ?? '',
        purchaseId: purchase.id,
      })

      await supabase
        .from('purchases')
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq('id', purchase.id)

      sent++
    } catch (emailError) {
      console.error('[review-request cron] email error for purchase', purchase.id, emailError)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: pending.length })
}
