import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 bg-brand-black text-white overflow-hidden relative">
      {/* Decorative circles */}
      <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#FF90E8]/10 blur-xl pointer-events-none" />
      <div className="absolute -right-8 bottom-0 w-48 h-48 rounded-full bg-[#FF007A]/15 blur-xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
          Your first dollar is waiting.
          <br />
          <span className="text-[#FF90E8]">Start today.</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Free to create. Free to sell. Zero monthly fees.
          <br />You only pay a small transaction fee when you make a sale.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF007A] text-white text-lg font-bold rounded-xl hover:bg-[#e0006e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Create your free account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/5 transition-all"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  )
}
