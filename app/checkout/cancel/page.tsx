import Link from 'next/link'
import { XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getTranslations } from '@/lib/i18n'

interface Props {
  searchParams: Promise<{ lang?: string }>
}

export default async function CheckoutCancelPage({ searchParams }: Props) {
  const { lang } = await searchParams
  const t = getTranslations(lang)
  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <XCircle className="w-16 h-16 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-brand-black mb-2">{t.paymentCancelledTitle}</h1>
        <p className="text-gray-500 mb-6">
          {t.paymentCancelledBody}
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/checkout">
            <Button variant="primary" className="w-full">{t.returnToCart}</Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" className="w-full">{t.browseProducts}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
