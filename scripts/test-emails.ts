#!/usr/bin/env node
/**
 * scripts/test-emails.ts
 *
 * Sends test versions of every transactional email so you can preview
 * them in your inbox and verify the design looks right.
 *
 * Usage:
 *   npx tsx scripts/test-emails.ts [--to you@example.com] [--email purchase|review|all]
 *
 * Required env vars (set in .env or export before running):
 *   RESEND_API_KEY     — your Resend API key
 *   RESEND_FROM_EMAIL  — (optional) sender address, defaults to noreply@sellifystore.com
 *   NEXT_PUBLIC_SITE_URL — (optional) base URL for links in emails
 */

import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '..', '.env') })
config({ path: path.resolve(__dirname, '..', '.env.local'), override: true })

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { PurchaseConfirmationEmail } from '../emails/PurchaseConfirmation.js'
import { ReviewRequestEmail } from '../emails/ReviewRequest.js'

/* ─── CLI args ────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2)
const toIdx = args.indexOf('--to')
const emailIdx = args.indexOf('--email')
const TO = toIdx !== -1 ? args[toIdx + 1] : process.env.TEST_EMAIL_TO
const WHICH = emailIdx !== -1 ? args[emailIdx + 1] : 'all'

if (!TO) {
  console.error('❌  Please provide a recipient email:\n   npx tsx scripts/test-emails.ts --to you@example.com')
  process.exit(1)
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY) {
  console.error('❌  RESEND_API_KEY is not set. Add it to your .env file.')
  process.exit(1)
}

const resend = new Resend(RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Sellify <noreply@sellifystore.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sellifystore.com'

/* ─── Sample data ─────────────────────────────────────────────────────────── */
const SAMPLE_PURCHASE = {
  buyerName: 'Jane Doe',
  productTitle: 'The Ultimate Guide to Building a SaaS Business',
  productBannerUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
  sellerName: 'Alex Creator',
  amountPaid: 2900, // $29.00 in cents
  currency: 'USD',
  libraryUrl: `${SITE_URL}/library`,
  downloadUrl: `${SITE_URL}/api/download/test-purchase-id`,
  siteUrl: SITE_URL,
}

const SAMPLE_REVIEW = {
  buyerName: 'Jane Doe',
  productTitle: 'The Ultimate Guide to Building a SaaS Business',
  productBannerUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
  sellerName: 'Alex Creator',
  reviewUrl: `${SITE_URL}/alexcreator/saas-guide#reviews`,
  libraryUrl: `${SITE_URL}/library`,
  siteUrl: SITE_URL,
}

/* ─── Senders ─────────────────────────────────────────────────────────────── */
async function sendPurchaseConfirmationTest() {
  console.log('\n📧  Sending purchase confirmation test email…')
  const html = await render(PurchaseConfirmationEmail(SAMPLE_PURCHASE))
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO!,
    subject: '[TEST] You got "The Ultimate Guide to Building a SaaS Business" — access it now!',
    html,
  })
  if (error) {
    console.error('  ❌  Failed:', error.message)
  } else {
    console.log(`  ✅  Sent! Email ID: ${data?.id}`)
  }
}

async function sendReviewRequestTest() {
  console.log('\n📧  Sending review request test email…')
  const html = await render(ReviewRequestEmail(SAMPLE_REVIEW))
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO!,
    subject: '[TEST] How are you enjoying "The Ultimate Guide to Building a SaaS Business"? Leave a review!',
    html,
  })
  if (error) {
    console.error('  ❌  Failed:', error.message)
  } else {
    console.log(`  ✅  Sent! Email ID: ${data?.id}`)
  }
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
console.log(`\n🚀  Sellify Email Test Runner`)
console.log(`   Sending to: ${TO}`)
console.log(`   From:       ${FROM}`)
console.log(`   Emails:     ${WHICH}\n`)

if (WHICH === 'purchase') {
  await sendPurchaseConfirmationTest()
} else if (WHICH === 'review') {
  await sendReviewRequestTest()
} else {
  await sendPurchaseConfirmationTest()
  await sendReviewRequestTest()
}

console.log('\n✨  Done! Check your inbox.\n')
