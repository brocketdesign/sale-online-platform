'use client'

import { useCountUp } from '@/hooks/useCountUp'

interface LiveEarningsSectionProps {
  revenue: number
}

export default function LiveEarningsSection({ revenue }: LiveEarningsSectionProps) {
  const baseRevenue = revenue > 0 ? Math.floor(revenue / 100) : 2_106_909

  const liveRevenue = useCountUp({
    end: baseRevenue,
    duration: 2800,
    delay: 0,
    liveIncrement: 9,
    liveInterval: 900,
  })

  return (
    <section className="bg-[#f4f0e8] py-20 border-y border-gray-200">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-6xl sm:text-8xl lg:text-9xl font-black text-brand-black tabular-nums leading-none tracking-tight">
          ${Math.floor(liveRevenue).toLocaleString()}
        </p>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">Live</span>
        </div>

        <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed">
          The amount of income earned by digital entrepreneurs on our platform this week.
        </p>
      </div>
    </section>
  )
}
