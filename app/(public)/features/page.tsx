import Link from 'next/link'
import type { Metadata } from 'next'
import {
  FileText,
  Music,
  Video,
  Package,
  Tag,
  Heart,
  Star,
  Lock,
  BarChart2,
  Globe,
  Zap,
  Mail,
  Smile,
  RefreshCcw,
  ShieldCheck,
  CreditCard,
  Users,
  Download,
} from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Features — Sellify',
  description: 'Everything you need to sell, deliver, and grow your digital product business — all in one place.',
}

const categories = [
  {
    title: 'Sell anything digital',
    subtitle: 'One platform, every file format',
    description:
      'Turn any file into a product. Whether you create PDFs, audio, video, code, or templates, Sellify handles the rest.',
    color: 'bg-blue-50',
    accent: 'text-blue-600',
    features: [
      { icon: FileText, label: 'PDFs & eBooks', desc: 'Sell guides, reports, templates, and written courses.' },
      { icon: Music, label: 'Audio & podcasts', desc: 'Music, soundpacks, meditation tracks, language lessons.' },
      { icon: Video, label: 'Video & courses', desc: 'Tutorials, masterclasses, coaching sessions, vlogs.' },
      { icon: Package, label: 'Software & tools', desc: 'Apps, scripts, presets, plugins, Notion templates.' },
    ],
  },
  {
    title: 'Powerful selling tools',
    subtitle: 'Pricing and promotions built in',
    description:
      "You shouldn't need a separate app to run a discount or offer a free tier. These tools are built into every product.",
    color: 'bg-[#FF90E8]/10',
    accent: 'text-[#FF007A]',
    features: [
      { icon: Tag, label: 'Flexible pricing', desc: 'Fixed price, pay-what-you-want, or free — your call.' },
      { icon: RefreshCcw, label: 'Discount codes', desc: 'Percentage or flat discounts with usage limits and expiry dates.' },
      { icon: Heart, label: 'Gift purchases', desc: 'Buyers can send products as gifts with a personal message.' },
      { icon: Users, label: 'Upsells', desc: 'Checkout automatically surfaces your other products.' },
    ],
  },
  {
    title: 'Trust & social proof',
    subtitle: 'Ratings that convert browsers into buyers',
    description:
      'Verified reviews from real buyers build the credibility your product page needs to close the sale.',
    color: 'bg-yellow-50',
    accent: 'text-yellow-600',
    features: [
      { icon: Star, label: 'Verified ratings', desc: 'Only buyers who purchased can leave a review.' },
      { icon: Smile, label: 'WhatsApp testimonials', desc: 'Screenshot real customer messages and embed them on your page.' },
      { icon: BarChart2, label: 'Sales count badge', desc: 'Show buyers how many people have already purchased.' },
      { icon: Globe, label: 'Public storefront', desc: 'A beautiful page for all your products at yourname.sellify.io.' },
    ],
  },
  {
    title: 'Secure delivery',
    subtitle: 'Files arrive safely, every time',
    description:
      'We handle hosting, delivery, and piracy protection so you can focus on creating — not infrastructure.',
    color: 'bg-green-50',
    accent: 'text-green-600',
    features: [
      { icon: Lock, label: 'Signed download links', desc: 'Time-limited URLs mean only buyers who paid can download.' },
      { icon: ShieldCheck, label: 'Fraud protection', desc: 'Stripe handles payment security and chargeback management.' },
      { icon: Download, label: 'Unlimited downloads', desc: 'Buyers can re-download purchases from their library anytime.' },
      { icon: Zap, label: 'Instant delivery', desc: 'Files are delivered the second a payment clears.' },
    ],
  },
  {
    title: 'Analytics & growth',
    subtitle: 'Data that helps you earn more',
    description:
      'Understand where your sales come from, which products perform best, and which pages convert.',
    color: 'bg-purple-50',
    accent: 'text-purple-600',
    features: [
      { icon: BarChart2, label: 'Revenue dashboard', desc: 'Track earnings by day, week, month, or all-time.' },
      { icon: Globe, label: 'Traffic sources', desc: 'See which links and platforms drive the most sales.' },
      { icon: Mail, label: 'Buyer emails', desc: 'Export your customer list anytime to build your audience.' },
      { icon: CreditCard, label: 'Payout history', desc: 'A full record of every transfer to your bank account.' },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-offwhite border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-brand-black mb-5">
            Everything you need.<br className="hidden sm:block" /> Nothing you don't.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Sellify is a complete platform for selling digital products. No plugins, no integrations,
            no monthly plans — just a simple 10% fee when you make a sale.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-4 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
              Start selling for free
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-white text-brand-black font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Feature categories */}
      {categories.map((cat, catIdx) => (
        <section
          key={cat.title}
          className={`py-20 ${catIdx % 2 === 1 ? 'bg-brand-offwhite' : 'bg-white'} border-b border-gray-100`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              {/* Left — section header */}
              <div className="lg:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                  {cat.subtitle}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-brand-black mb-4">
                  {cat.title}
                </h2>
                <p className="text-gray-500 leading-relaxed">{cat.description}</p>
              </div>

              {/* Right — feature grid */}
              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
                {cat.features.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${cat.accent}`} />
                    </div>
                    <h3 className="font-bold text-brand-black mb-1">{label}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-brand-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-black mb-4">Start selling today</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Create your free account. No credit card required.
            Your first product can be live in under five minutes.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-brand-black font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
