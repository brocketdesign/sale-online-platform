import Link from 'next/link'
import { XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <XCircle className="w-16 h-16 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-brand-black mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 mb-6">
          No worries — your cart is still saved. You can complete your purchase whenever you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/checkout">
            <Button variant="primary" className="w-full">Return to Cart</Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" className="w-full">Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
