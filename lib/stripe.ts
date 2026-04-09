import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export function formatAmountForStripe(amount: number, currency: string): number {
  // amount is in cents already
  return Math.round(amount)
}

export function formatAmountFromStripe(amount: number, currency: string): number {
  return amount
}
