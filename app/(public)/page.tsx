import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import CategorySection from '@/components/landing/CategorySection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/layout/Footer'
import { getHeroPlaceholderImages } from '@/lib/xai'

async function getStats() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
    const total = (data ?? []).reduce((sum: number, o: { total_amount: number }) => sum + o.total_amount, 0)
    return { revenue: total, sellers: 0 }
  } catch {
    return { revenue: 0, sellers: 0 }
  }
}

export default async function HomePage() {
  const [stats, placeholderImages] = await Promise.all([
    getStats(),
    Promise.resolve(getHeroPlaceholderImages()),
  ])

  return (
    <>
      <HeroSection stats={stats} placeholderImages={placeholderImages} />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CategorySection />
      <CTASection />
      <Footer />
    </>
  )
}
