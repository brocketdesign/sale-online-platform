import Stripe from 'stripe'
import { ZERO_DECIMAL_CURRENCIES } from '@/lib/utils'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

/**
 * Convert an amount stored in the DB (always ×100) to a Stripe unit_amount.
 * - Regular currencies (USD, EUR…): Stripe expects cents → keep as-is.
 * - Zero-decimal currencies (JPY, KRW, VND…): Stripe expects the whole unit → divide by 100.
 */
export function formatAmountForStripe(amount: number, currency: string): number {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())
  return isZeroDecimal ? Math.round(amount / 100) : Math.round(amount)
}

export function formatAmountFromStripe(amount: number, currency: string): number {
  return amount
}
