'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice, COUNTRIES, getVatRate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Gift, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getTranslations } from '@/lib/i18n'

const contactSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name required'),
  country: z.string().min(2, 'Country required'),
  vatId: z.string().optional(),
})

type ContactForm = z.infer<typeof contactSchema>

const TIP_PERCENT_OPTIONS = [
  { value: 0 },
  { value: 0.15 },
  { value: 0.2 },
  { value: 0.25 },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, subtotal } = useCart()
  const [lang, setLang] = useState<string | undefined>(items[0]?.pageLanguage)
  const t = getTranslations(lang)
  const [tipPercent, setTipPercent] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [isCustomTip, setIsCustomTip] = useState(false)
  const [giftEnabled, setGiftEnabled] = useState(false)
  const [giftEmail, setGiftEmail] = useState('')
  const [giftNote, setGiftNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Fetch fresh page_language from DB so stale localStorage cart data is corrected
  const firstProductId = items[0]?.productId
  useEffect(() => {
    if (!firstProductId) return
    setLang(items[0]?.pageLanguage)
    const supabase = createClient()
    supabase
      .from('products')
      .select('page_language')
      .eq('id', firstProductId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.page_language) setLang(data.page_language)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstProductId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { country: 'US' },
  })

  // Pre-fill form from logged-in session
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) { setValue('email', user.email); setIsLoggedIn(true) }
      if (user?.user_metadata?.full_name) setValue('name', user.user_metadata.full_name)
    })
  }, [setValue])

  const countryCode = watch('country')
  const sub = subtotal()

  const tipAmount = useMemo(() => {
    if (isCustomTip) return Math.round((parseFloat(customTip) || 0) * 100)
    return Math.round(sub * tipPercent)
  }, [sub, tipPercent, isCustomTip, customTip])

  const vatRate = useMemo(() => getVatRate(countryCode), [countryCode])
  const vatAmount = useMemo(() => Math.round((sub + tipAmount) * vatRate), [sub, tipAmount, vatRate])
  const total = sub + tipAmount + vatAmount

  async function onSubmit(values: ContactForm) {
    if (items.length === 0) {
      toast.error(t.emptyCartTitle)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          tip: tipAmount,
          buyerInfo: values,
          gift: giftEnabled ? { recipientEmail: giftEmail, note: giftNote } : null,
          vatAmount,
          vatRate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
      window.location.href = data.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout error'
      toast.error(msg)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-brand-black mb-3">{getTranslations(undefined).emptyCartTitle}</h1>
        <p className="text-gray-500 mb-6">{getTranslations(undefined).emptyCartBody}</p>
        <Link href="/discover">
          <Button variant="primary">{getTranslations(undefined).browseProducts}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/discover" className="text-sm text-gray-500 hover:text-brand-magenta mb-6 inline-block">
          {t.continueShoppingLink}
        </Link>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Cart items */}
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-semibold text-lg mb-4">{t.yourOrder}</h2>
                <ul className="divide-y divide-gray-50">
                  {items.map(item => (
                    <CartItemRow key={item.id} item={item} lang={lang} />
                  ))}
                </ul>
              </section>

              {/* Gift toggle */}
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <button
                  type="button"
                  onClick={() => setGiftEnabled(!giftEnabled)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-magenta transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  {giftEnabled ? t.removeGiftOption : t.sendAsGift}
                  <ChevronDown className={`w-4 h-4 transition-transform ${giftEnabled ? 'rotate-180' : ''}`} />
                </button>

                {giftEnabled && (
                  <div className="mt-4 space-y-3">
                    <Input
                      label={t.recipientEmail}
                      type="email"
                      placeholder="friend@example.com"
                      value={giftEmail}
                      onChange={e => setGiftEmail(e.target.value)}
                    />
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">{t.giftNote}</label>
                      <textarea
                        value={giftNote}
                        onChange={e => setGiftNote(e.target.value)}
                        rows={2}
                        placeholder={t.giftNotePlaceholder}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta resize-none"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Tip selector */}
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-medium text-sm text-gray-700 mb-3">{t.tipCreators}</h3>
                <div className="flex flex-wrap gap-2">
                  {TIP_PERCENT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setTipPercent(opt.value); setIsCustomTip(false) }}
                      className={[
                        'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                        !isCustomTip && tipPercent === opt.value
                          ? 'bg-brand-magenta text-white border-brand-magenta'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-magenta',
                      ].join(' ')}
                    >
                      {opt.value === 0 ? t.noTip : `${Math.round(opt.value * 100)}%`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomTip(true)}
                    className={[
                      'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                      isCustomTip
                        ? 'bg-brand-magenta text-white border-brand-magenta'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-magenta',
                    ].join(' ')}
                  >
                    {t.customTip}
                  </button>
                </div>
                {isCustomTip && (
                  <div className="mt-3 flex items-center gap-2 max-w-[200px]">
                    <span className="text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customTip}
                      onChange={e => setCustomTip(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
                    />
                  </div>
                )}
              </section>

              {/* Contact info */}
              <section className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-semibold text-lg mb-4">{t.contactInformation}</h2>
                <div className="space-y-4">
                  <Input
                    label={t.emailLabel}
                    type="email"
                    placeholder={t.emailPlaceholder}
                    error={errors.email?.message}
                    readOnly={isLoggedIn}
                    className={isLoggedIn ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                    {...register('email')}
                  />
                  <Input
                    label={t.fullNameLabel}
                    placeholder={t.fullNamePlaceholder}
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t.countryLabel}</label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
                      {...register('country')}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-xs text-red-500">{errors.country.message}</p>
                    )}
                  </div>
                  {vatRate > 0 && (
                    <Input
                      label={t.vatLabel}
                      placeholder={t.vatPlaceholder}
                      hint={t.vatHint}
                      {...register('vatId')}
                    />
                  )}
                </div>
              </section>
            </div>

            {/* Right column — Order summary */}
            <div className="lg:sticky lg:top-24 self-start space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-semibold text-lg mb-4">{t.orderSummary}</h2>
                <dl className="space-y-2 text-sm">
                  <SummaryRow label={t.subtotalLabel} value={formatPrice(sub, items[0]?.currency ?? 'USD')} />
                  {tipAmount > 0 && (
                    <SummaryRow label={t.tipLabel} value={`+ ${formatPrice(tipAmount, items[0]?.currency ?? 'USD')}`} />
                  )}
                  {vatRate > 0 && (
                    <SummaryRow
                      label={t.vatSummary(Math.round(vatRate * 100))}
                      value={`+ ${formatPrice(vatAmount, items[0]?.currency ?? 'USD')}`}
                    />
                  )}
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <SummaryRow
                      label={t.totalLabel}
                      value={formatPrice(total, items[0]?.currency ?? 'USD')}
                      bold
                    />
                  </div>
                </dl>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {t.payButton(formatPrice(total, items[0]?.currency ?? 'USD'))}
              </Button>

              <p className="text-center text-xs text-gray-400">
                {t.stripeDisclaimer}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function CartItemRow({ item, lang }: { item: import('@/types/database').CartItem; lang?: string }) {
  const { removeItem } = useCart()
  const t = getTranslations(lang ?? item.pageLanguage)
  return (
    <li className="flex items-center gap-3 py-3">
      {item.bannerUrl && (
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
          <Image src={item.bannerUrl} alt={item.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">{item.title}</div>
        <div className="text-xs text-gray-500">{t.cartItemBy} {item.sellerName}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{formatPrice(item.price, item.currency)}</span>
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </li>
  )
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-base text-brand-black' : 'text-gray-600'}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
