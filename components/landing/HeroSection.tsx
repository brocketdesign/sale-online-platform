'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ArrowRight, Zap, Shield, TrendingUp, Star } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import type { HeroPlaceholderImage } from '@/lib/xai'

interface HeroProps {
  stats: { revenue: number; sellers: number }
  placeholderImages?: HeroPlaceholderImage[]
}

// ─── Animated stat card ────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  prefix = '',
  suffix = '',
  delay = 0,
  liveIncrement = 0,
}: {
  value: number
  label: string
  prefix?: string
  suffix?: string
  delay?: number
  liveIncrement?: number
}) {
  const count = useCountUp({ end: value, duration: 2200, delay, liveIncrement, liveInterval: 3500 })

  const formatted =
    value % 1 !== 0
      ? count.toFixed(1)
      : Math.floor(count).toLocaleString()

  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="flex items-end gap-0.5">
        {prefix && <span className="text-2xl sm:text-3xl font-black text-brand-black leading-none">{prefix}</span>}
        <span className="text-3xl sm:text-4xl font-black text-brand-black tabular-nums leading-none">
          {formatted}
        </span>
        {suffix && (
          <span className="text-2xl sm:text-3xl font-black text-[#FF007A] leading-none">{suffix}</span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        {liveIncrement > 0 && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Mini product preview card ─────────────────────────────────────────────
function ProductPreviewCard({
  item,
  rotate = 0,
}: {
  item: HeroPlaceholderImage
  rotate?: number
}) {
  const price = (item.price / 100).toFixed(0)

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-44 flex-shrink-0"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="relative h-28 bg-gradient-to-br from-[#FF90E8]/30 to-[#FF007A]/20 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-semibold px-2 py-0.5 rounded-full text-gray-600 shadow-sm">
          {item.category}
        </span>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-brand-black line-clamp-1">{item.title}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{item.seller}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-black text-brand-black">${price}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────
export default function HeroSection({ stats, placeholderImages = [] }: HeroProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/discover?q=${encodeURIComponent(query)}`)
  }

  // Use real revenue if > 0, otherwise fall back to impressive placeholder ($1.24M)
  const displayRevenueMil =
    stats.revenue > 0 ? stats.revenue / 100 / 1_000_000 : 1.24

  return (
    <section className="relative overflow-hidden bg-[#f4f0e8] min-h-[88vh] flex items-center">
      {/* Decorative shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-8 w-24 h-24 rounded-full bg-[#FF90E8] opacity-40 blur-sm" />
        <div className="absolute top-32 right-16 w-16 h-16 rounded-full bg-[#FF007A] opacity-30 blur-sm" />
        <div className="absolute bottom-24 left-1/4 w-20 h-20 rounded-full bg-[#FF90E8] opacity-25 blur-sm" />
        <div className="absolute top-1/2 right-8 w-12 h-12 rounded-full bg-yellow-300 opacity-50 blur-sm" />
        <div className="absolute bottom-16 right-1/3 w-10 h-10 rounded-full bg-[#FF007A] opacity-20 blur-sm" />
        <div className="absolute -right-12 top-24 w-56 h-56 rounded-full border-4 border-[#FF90E8]/30" />
        <div className="absolute -left-16 bottom-16 w-40 h-40 rounded-full border-4 border-[#FF007A]/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600 mb-8 shadow-sm">
          <Zap className="w-4 h-4 text-[#FF007A]" />
          Simple · Fast · No monthly fees
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-brand-black leading-[1.0] tracking-tight mb-6">
          Go from{' '}
          <span className="text-[#FF007A]">0</span>
          {' '}to{' '}
          <span className="relative inline-block">
            <span className="text-[#FF007A]">$1</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M2 6 Q100 2 198 6" stroke="#FF007A" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
          Anyone can earn their first dollar online.<br />
          Start with what you know — sell it instantly.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-black text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start selling free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-black text-lg font-semibold rounded-xl border-2 border-brand-black hover:bg-gray-50 transition-all shadow-sm"
          >
            Browse products
          </Link>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-14">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search marketplace..."
              className="w-full pl-12 pr-14 py-4 rounded-xl border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-[#FF007A] bg-white shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 px-3 py-2 bg-brand-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* ── Animated metrics ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center mb-12">
          <StatCard
            prefix="$"
            value={displayRevenueMil}
            suffix="M+"
            label="earned by creators"
            delay={200}
            liveIncrement={0.01}
          />

          <div className="w-px h-10 bg-gray-300 hidden sm:block" />

          <StatCard
            value={104_230}
            suffix="+"
            label="digital products"
            delay={450}
            liveIncrement={1}
          />

          <div className="w-px h-10 bg-gray-300 hidden sm:block" />

          <StatCard
            value={12_847}
            suffix="+"
            label="active creators"
            delay={700}
            liveIncrement={1}
          />

          <div className="w-px h-10 bg-gray-300 hidden sm:block" />

          <StatCard
            value={0}
            suffix="%"
            label="platform fee to start"
            delay={950}
          />

          <div className="w-px h-10 bg-gray-300 hidden sm:block" />

          <StatCard
            value={50}
            suffix="+"
            label="countries"
            delay={1200}
          />
        </div>

        {/* ── AI-generated product preview strip ───────────────────────── */}
        {placeholderImages.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Trending on the marketplace
            </p>
            <div className="flex items-end justify-center gap-5 flex-wrap">
              {placeholderImages.map((item, i) => (
                <ProductPreviewCard
                  key={i}
                  item={item}
                  rotate={i === 0 ? -2 : i === 2 ? 2 : 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure payments via Stripe</span>
          <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Instant file delivery</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> No credit card to start</span>
        </div>
      </div>
    </section>
  )
}

