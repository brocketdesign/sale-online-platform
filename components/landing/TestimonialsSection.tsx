import Image from 'next/image'
import { Star } from 'lucide-react'

const SUPABASE_URL = 'https://uvhzhrqqkjdeisfyqsdu.supabase.co/storage/v1/object/public/assets/avatars'

const testimonials = [
  {
    name: 'Alex Morgan',
    role: 'Fitness Coach',
    avatarUrl: `${SUPABASE_URL}/alex-morgan.jpeg`,
    quote: 'I uploaded my workout program PDF and made my first sale within 24 hours. No tech skills needed — just filled in the form and shared my link.',
    product: 'Training Programs',
    stars: 5,
  },
  {
    name: 'Sarah Chen',
    role: 'Graphic Designer',
    avatarUrl: `${SUPABASE_URL}/sarah-chen.jpeg`,
    quote: "I sell Notion templates and design assets. The checkout experience is clean and professional. My conversion rate doubled compared to my old setup.",
    product: 'Design Templates',
    stars: 5,
  },
  {
    name: 'Marcus B.',
    role: 'Music Producer',
    avatarUrl: `${SUPABASE_URL}/marcus-b.jpeg`,
    quote: "Selling beats and sample packs has never been easier. Upload the ZIP, set the price, done. Customers get their files instantly.",
    product: 'Music & Audio',
    stars: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-brand-black mb-4">
            Real people, real results
          </h2>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Join creators who turned their knowledge into income.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[#f4f0e8] rounded-2xl p-7 flex flex-col gap-5 hover:shadow-sm transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed flex-1 text-sm">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
                  <Image src={t.avatarUrl} alt={t.name} fill className="object-cover" sizes="40px" unoptimized />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-black">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} · {t.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
