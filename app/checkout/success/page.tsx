import { redirect } from 'next/navigation'
import Link from 'next/link'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { sendPurchaseConfirmationEmail } from '@/lib/resend'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) redirect('/')

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    })
  } catch {
    redirect('/')
  }

  if (session.payment_status !== 'paid') {
    return (
      <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Payment not confirmed</h1>
        <p className="text-gray-500 mb-6">Your payment has not been processed. Please try again.</p>
        <Link href="/checkout">
          <Button variant="primary">Back to Checkout</Button>
        </Link>
      </div>
    )
  }

  // Parse metadata
  const meta = session.metadata ?? {}
  const buyerEmail = session.customer_email ?? meta.buyer_email ?? ''
  const buyerName = meta.buyer_name ?? ''
  const buyerCountry = meta.buyer_country ?? ''
  const tipAmount = parseInt(meta.tip_amount ?? '0', 10)
  const vatAmount = parseInt(meta.vat_amount ?? '0', 10)
  const giftRecipientEmail = meta.gift_recipient_email ?? ''
  const giftNote = meta.gift_note ?? ''
  const cartItems: Array<{ productId: string; price: number; currency: string }> = JSON.parse(
    meta.cart_items ?? '[]'
  )

  const supabase = await createServiceClient()

  // Idempotency check — if already processed, skip writes
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session_id)
    .maybeSingle()

  let orderId: string | null = existingOrder?.id ?? null

  if (!existingOrder) {
    const totalAmount = cartItems.reduce((s, i) => s + i.price, 0) + tipAmount + vatAmount
    const currency = cartItems[0]?.currency ?? 'USD'

    // Resolve buyer user id (may not exist)
    let buyerUserId: string | null = null

    const { data: existingUserData } = await supabase.auth.admin.listUsers()
    const existingUser = existingUserData?.users?.find((u: { email?: string }) => u.email === buyerEmail)
    buyerUserId = existingUser?.id ?? null

    // Auto-create buyer account if not found
    if (!buyerUserId && buyerEmail) {
      const { data: newUser } = await supabase.auth.admin.createUser({
        email: buyerEmail,
        email_confirm: true,
        user_metadata: { full_name: buyerName },
      })
      buyerUserId = newUser.user?.id ?? null
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerUserId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        stripe_session_id: session_id,
        status: 'completed',
        total_amount: totalAmount,
        currency,
        tip_amount: tipAmount,
        gift_recipient_email: giftRecipientEmail || null,
        gift_note: giftNote || null,
        country: buyerCountry,
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('[success] order insert error', orderError)
    } else {
      orderId = order.id

      // Insert order items
      const orderItems = cartItems.map(item => ({
        order_id: orderId!,
        product_id: item.productId,
        quantity: 1,
        unit_price: item.price,
        currency: item.currency,
      }))
      await supabase.from('order_items').insert(orderItems)

      // Create purchases for the actual recipient (gift or buyer)
      const recipientEmail = giftRecipientEmail || buyerEmail
      const recipientUser = existingUserData?.users?.find((u: { email?: string; id: string }) => u.email === recipientEmail)
      const recipientId = recipientUser?.id ?? buyerUserId

      const purchases = cartItems.map(item => ({
        order_id: orderId!,
        product_id: item.productId,
        buyer_id: recipientId,
        buyer_email: recipientEmail,
        amount_paid: item.price,
        currency: item.currency,
      }))
      await supabase.from('purchases').insert(purchases)

      // Send purchase confirmation email (non-critical)
      if (recipientEmail) {
        try {
          // Fetch product + seller info for the first item for the email
          const firstItem = cartItems[0]
          if (firstItem) {
            const { data: productData } = await supabase
              .from('products')
              .select('id, title, banner_url, seller:profiles!products_seller_id_fkey(display_name, username)')
              .eq('id', firstItem.productId)
              .maybeSingle()

            // Get the inserted purchase id for the download link
            const { data: firstPurchase } = await supabase
              .from('purchases')
              .select('id')
              .eq('order_id', orderId!)
              .eq('product_id', firstItem.productId)
              .maybeSingle()

            const seller = (productData?.seller as unknown as { display_name: string | null; username: string } | null)

            await sendPurchaseConfirmationEmail({
              to: recipientEmail,
              buyerName: buyerName,
              productTitle: productData?.title ?? 'Your purchase',
              productBannerUrl: productData?.banner_url,
              sellerName: seller?.display_name ?? seller?.username ?? 'the creator',
              amountPaid: cartItems.reduce((s, i) => s + i.price, 0),
              currency: firstItem.currency,
              purchaseId: firstPurchase?.id ?? '',
            })

            // Mark email sent
            if (firstPurchase?.id) {
              await supabase
                .from('purchases')
                .update({ purchase_email_sent_at: new Date().toISOString() })
                .eq('id', firstPurchase.id)
            }
          }
        } catch (emailError) {
          console.error('[success] purchase email error', emailError)
        }
      }

      // Increment sales_count for each product
      for (const item of cartItems) {
        try {
          await supabase.rpc('increment_sales_count', { product_id: item.productId })
        } catch {
          // non-critical, silently skip
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-brand-black mb-2">Payment Successful!</h1>
        {giftRecipientEmail ? (
          <p className="text-gray-500 mb-6">
            Your gift has been sent to <strong>{giftRecipientEmail}</strong>.
          </p>
        ) : (
          <p className="text-gray-500 mb-6">
            A confirmation has been sent to <strong>{buyerEmail}</strong>.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/library">
            <Button variant="primary" className="w-full">
              Go to My Library
            </Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
