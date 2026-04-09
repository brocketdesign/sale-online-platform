import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, X, Zap } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Pricing — Sellify',
  description: 'Keep more of what you earn. No monthly fees, no setup costs — just a small fee when you make a sale.',
}

const included = [
  'Unlimited products',
  'Unlimited file storage',
  'Custom product pages',
  'Pay-what-you-want pricing',
  'Discount & coupon codes',
  'Ratings & reviews',
  'Secure file delivery',
  'Instant payouts to your bank',
  'Buyer analytics dashboard',
  'Email receipts',
  'Custom storefront URL',
  'Mobile-optimised checkout',
]

const notIncluded = [
  'Monthly subscription fee',
  'Setup or listing fees',
  'Hidden transaction fees',
  'Long-term contracts',
]

const faqs = [
  {
    q: 'When do I get paid?',
    a: 'Payouts are processed via Stripe and land in your bank account within 2 business days of each sale. You can view all earnings in your dashboard.',
  },
  {
    q: 'What payment methods do buyers use?',
    a: 'Buyers can pay with any major credit or debit card. Apple Pay and Google Pay are supported on compatible devices.',
  },
  {
    q: 'Are there limits on file size or product count?',
    a: 'No. You can upload files of any size and list as many products as you want. Storage is unlimited.',
  },
  {
    q: 'Do you charge tax on behalf of sellers?',
    a: 'Sellify automatically collects and remits VAT and sales tax in supported regions. You never have to think about EU VAT or US sales tax.',
  },
  {
    q: 'Can I offer refunds?',
    a: "Yes. You can issue refunds from your dashboard at any time. Sellify's fee is non-refundable, but the rest returns to the buyer.",
  },
  {
    q: 'What if I sell a $0 product?',
    a: "Free products are always 100% free — for you and your buyers. There's no fee on $0 purchases.",
  },
]

const comparisons = [
  { platform: 'Sellify', fee: '10%', monthly: '$0', storage: 'Unlimited', payouts: '2 business days' },
  { platform: 'Gumroad', fee: '10%', monthly: '$0', storage: 'Unlimited', payouts: '7 days' },
  { platform: 'Payhip', fee: '5%', monthly: '$29+', storage: '5 GB', payouts: 'Varies' },
  { platform: 'Shopify', fee: '0.5–2%', monthly: '$39+', storage: 'Limited', payouts: '3 business days' },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-offwhite border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            No monthly fees. Ever.
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-brand-black mb-5">
            Keep 90% of every sale
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            We take a flat 10% on each sale. No setup costs, no subscription, no contracts.
            Start selling for free in minutes.
          </p>
        </div>
      </section>

      {/* Pricing card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Main card */}
          <div className="rounded-3xl bg-brand-black text-white p-10">
            <div className="mb-6">
              <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">One simple plan</span>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-7xl font-black">10%</span>
                <span className="text-gray-400 mb-3 text-lg">per sale</span>
              </div>
              <p className="text-gray-400 text-sm">
                That's it. No surprises. When you earn $1,000, you keep $900.
              </p>
            </div>

            <Link
              href="/register"
              className="block w-full text-center py-4 bg-white text-brand-black font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors mb-8"
            >
              Start selling for free →
            </Link>

            <ul className="space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's NOT included */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-brand-black mb-5">What you'll never pay</h3>
              <ul className="space-y-3">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <X className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-brand-offwhite border border-gray-200 p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Example earnings</h3>
              <div className="space-y-3">
                {[
                  { sale: '$10', keep: '$9' },
                  { sale: '$49', keep: '$44.10' },
                  { sale: '$99', keep: '$89.10' },
                  { sale: '$299', keep: '$269.10' },
                  { sale: '$999', keep: '$899.10' },
                ].map(({ sale, keep }) => (
                  <div key={sale} className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Sale of <span className="font-semibold text-brand-black">{sale}</span>
                    </span>
                    <span className="font-bold text-brand-black">You keep {keep}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-brand-offwhite border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-black text-brand-black mb-10 text-center">How we compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-6 font-semibold text-gray-500">Platform</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500">Fee per sale</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500">Monthly fee</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500">Storage</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500">Payouts</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr
                    key={row.platform}
                    className={`border-b border-gray-100 ${i === 0 ? 'bg-white' : ''}`}
                  >
                    <td className="py-4 pr-6 font-bold text-brand-black">
                      {row.platform}
                      {i === 0 && (
                        <span className="ml-2 text-xs bg-brand-black text-white px-2 py-0.5 rounded-full">You're here</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-medium">{row.fee}</td>
                    <td className={`py-4 px-4 text-center font-medium ${row.monthly === '$0' ? 'text-green-600' : 'text-gray-500'}`}>{row.monthly}</td>
                    <td className={`py-4 px-4 text-center ${row.storage === 'Unlimited' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{row.storage}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{row.payouts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black text-brand-black mb-12 text-center">Frequently asked questions</h2>
        <div className="space-y-6">
          {faqs.map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-6">
              <h3 className="font-bold text-brand-black mb-2">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-black mb-4">Ready to start earning?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Create your free account, upload your first product, and start selling in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-brand-black font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors"
          >
            Start selling for free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
