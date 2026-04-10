import { Resend } from 'resend'
import { render } from '@react-email/render'
import { PurchaseConfirmationEmail } from '@/emails/PurchaseConfirmation'
import { ReviewRequestEmail } from '@/emails/ReviewRequest'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Sellify <noreply@sellifystore.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sellifystore.com'

/* ─── Purchase Confirmation ──────────────────────────────────────────────── */

interface SendPurchaseConfirmationParams {
  to: string
  buyerName: string
  productTitle: string
  productBannerUrl?: string | null
  sellerName: string
  amountPaid: number
  currency: string
  purchaseId: string
}

export async function sendPurchaseConfirmationEmail(params: SendPurchaseConfirmationParams) {
  const libraryUrl = `${SITE_URL}/library`
  const downloadUrl = `${SITE_URL}/api/download/${params.purchaseId}`

  const html = await render(
    PurchaseConfirmationEmail({
      buyerName: params.buyerName,
      productTitle: params.productTitle,
      productBannerUrl: params.productBannerUrl,
      sellerName: params.sellerName,
      amountPaid: params.amountPaid,
      currency: params.currency,
      libraryUrl,
      downloadUrl,
      siteUrl: SITE_URL,
    })
  )

  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `You got "${params.productTitle}" — access it now!`,
    html,
  })
}

/* ─── Review Request ─────────────────────────────────────────────────────── */

interface SendReviewRequestParams {
  to: string
  buyerName: string
  productTitle: string
  productBannerUrl?: string | null
  sellerName: string
  productSlug: string
  sellerUsername: string
  purchaseId: string
}

export async function sendReviewRequestEmail(params: SendReviewRequestParams) {
  const reviewUrl = `${SITE_URL}/${params.sellerUsername}/${params.productSlug}#reviews`
  const libraryUrl = `${SITE_URL}/library`

  const html = await render(
    ReviewRequestEmail({
      buyerName: params.buyerName,
      productTitle: params.productTitle,
      productBannerUrl: params.productBannerUrl,
      sellerName: params.sellerName,
      reviewUrl,
      libraryUrl,
      siteUrl: SITE_URL,
    })
  )

  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `How are you enjoying "${params.productTitle}"? Leave a review!`,
    html,
  })
}
