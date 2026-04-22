import { NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import type { CartItem } from '@/types/database'
import { STRIPE_LOCALE_MAP, type PageLanguage } from '@/lib/i18n'

interface GiftInfo {
  recipientEmail: string
  note: string
}

interface BuyerInfo {
  email: string
  name: string
  country: string
  vatId?: string
}

interface RequestBody {
  items: CartItem[]
  tip: number
  buyerInfo: BuyerInfo
  gift: GiftInfo | null
  vatAmount: number
  vatRate: number
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json()
    const { items, tip, buyerInfo, gift, vatAmount } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!buyerInfo?.email) {
      return NextResponse.json({ error: 'Buyer email required' }, { status: 400 })
    }

    const siteUrl = new URL(request.url).origin

    const primaryCurrency = items[0]?.currency ?? 'USD'

    // Build line items from cart
    const lineItems = items.map(item => ({
      price_data: {
        currency: item.currency.toLowerCase(),
        product_data: {
          name: item.title,
          description: `by ${item.sellerName}`,
          ...(item.bannerUrl ? { images: [item.bannerUrl] } : {}),
        },
        // All DB prices are stored ×100; convert to Stripe's expected unit_amount.
        unit_amount: formatAmountForStripe(item.price, item.currency),
      },
      quantity: 1,
    }))

    // Add tip as a separate line item if present
    if (tip > 0) {
      lineItems.push({
        price_data: {
          currency: primaryCurrency.toLowerCase(),
          product_data: { name: 'Tip for Creators 💜', description: 'Optional tip for the creators' },
          unit_amount: formatAmountForStripe(tip, primaryCurrency),
        },
        quantity: 1,
      })
    }

    // Add VAT line item if applicable
    if (vatAmount > 0) {
      lineItems.push({
        price_data: {
          currency: primaryCurrency.toLowerCase(),
          product_data: { name: `VAT (${body.vatRate ? Math.round(body.vatRate * 100) : 0}%)`, description: 'Value added tax' },
          unit_amount: formatAmountForStripe(vatAmount, primaryCurrency),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: buyerInfo.email,
      locale: (STRIPE_LOCALE_MAP[(items[0]?.pageLanguage ?? 'en') as PageLanguage] ?? 'auto') as any,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel?lang=${items[0]?.pageLanguage ?? 'en'}`,
      payment_intent_data: {
        statement_descriptor: 'SELLIFY',
      },
      metadata: {
        buyer_email: buyerInfo.email,
        buyer_name: buyerInfo.name,
        buyer_country: buyerInfo.country,
        buyer_vat_id: buyerInfo.vatId ?? '',
        cart_items: JSON.stringify(
          items.map(i => ({
            productId: i.productId,
            price: i.price,
            currency: i.currency,
          }))
        ),
        tip_amount: String(tip),
        vat_amount: String(vatAmount),
        gift_recipient_email: gift?.recipientEmail ?? '',
        gift_note: gift?.note ?? '',
        page_language: items[0]?.pageLanguage ?? 'en',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[checkout-session]', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
