import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, Clock, Briefcase } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Careers — Sellify',
  description: "Help us build the best platform for digital creators. We're a fully remote team that ships fast and cares deeply about our users.",
}

const openRoles = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    location: 'Remote — worldwide',
    type: 'Full-time',
    description:
      'Own entire product surfaces from database to UI. We work with Next.js, Supabase, TypeScript, and Stripe.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'Remote — worldwide',
    type: 'Full-time',
    description:
      "Shape how tens of thousands of creators experience Sellify. You'll lead UX for our seller and buyer surfaces.",
  },
  {
    title: 'Growth Marketing Manager',
    team: 'Marketing',
    location: 'Remote — Europe / Americas',
    type: 'Full-time',
    description:
      'Drive creator acquisition and activation through content, SEO, creator partnerships, and paid campaigns.',
  },
  {
    title: 'Customer Support Specialist',
    team: 'Support',
    location: 'Remote — Europe / Americas',
    type: 'Full-time',
    description:
      'Be the first person creators and buyers turn to when they need help. Empathy and speed matter more than scripts.',
  },
  {
    title: 'Data Analyst',
    team: 'Product',
    location: 'Remote — worldwide',
    type: 'Full-time',
    description:
      "Turn platform data into insights that drive product decisions. You'll work closely with product and engineering.",
  },
]

const perks = [
  { emoji: '🌍', label: 'Fully remote', desc: 'Work from wherever you do your best thinking.' },
  { emoji: '💰', label: 'Competitive salary', desc: 'Location-agnostic pay benchmarked to top-of-market.' },
  { emoji: '📚', label: 'Learning budget', desc: '$2,000/year for books, courses, and conferences.' },
  { emoji: '🏖️', label: 'Unlimited PTO', desc: 'We trust you. Take the time you need.' },
  { emoji: '💊', label: 'Health coverage', desc: 'Comprehensive health insurance for you and your family.' },
  { emoji: '🛠️', label: 'Home office stipend', desc: '$1,500 one-time to build your ideal setup.' },
  { emoji: '🤝', label: 'Equity package', desc: "Every employee has a stake in what we're building." },
  { emoji: '🎉', label: 'Annual retreat', desc: 'The whole team meets IRL once a year — past stops include Lisbon, Kyoto, and Cape Town.' },
]

const teamColors: Record<string, string> = {
  Engineering: 'bg-blue-50 text-blue-700',
  Design: 'bg-purple-50 text-purple-700',
  Marketing: 'bg-[#FF90E8]/20 text-[#FF007A]',
  Support: 'bg-green-50 text-green-700',
  Product: 'bg-yellow-50 text-yellow-700',
}

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Build the platform<br className="hidden sm:block" /> creators deserve.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {"We're a small, fully remote team on a mission to make selling digital products accessible to every creator on the planet. We move fast, care deeply, and love what we build."}
          </p>
        </div>
      </section>

      {/* Culture strip */}
      <section className="bg-brand-offwhite border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-brand-black mb-1">~30</div>
              <div className="text-sm text-gray-500">Team members across 18 countries</div>
            </div>
            <div>
              <div className="text-3xl font-black text-brand-black mb-1">100%</div>
              <div className="text-sm text-gray-500">Remote — no offices, no commutes</div>
            </div>
            <div>
              <div className="text-3xl font-black text-brand-black mb-1">Series A</div>
              <div className="text-sm text-gray-500">Well-funded with a long runway</div>
            </div>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Now hiring</span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-black mb-12">
            Open roles
          </h2>
          <div className="space-y-4">
            {openRoles.map((role) => (
              <div
                key={role.title}
                className="group bg-white border border-gray-100 rounded-2xl p-7 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          teamColors[role.team] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {role.team}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-black mb-1">{role.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{role.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {role.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {role.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {role.team}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:jobs@sellify.io?subject=Application: ${encodeURIComponent(role.title)}`}
                    className="shrink-0 px-5 py-2.5 bg-brand-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* No role callout */}
          <div className="mt-10 rounded-2xl bg-brand-offwhite border border-gray-200 p-8 text-center">
            <h3 className="font-bold text-brand-black mb-2">{"Don't see a role that fits?"}</h3>
            <p className="text-gray-500 text-sm mb-4">
              {"We're always looking for exceptional people. Send us a short note about who you are and how you'd like to contribute."}
            </p>
            <a
              href="mailto:jobs@sellify.io?subject=General application"
              className="inline-block px-6 py-2.5 border border-brand-black text-brand-black font-semibold text-sm rounded-lg hover:bg-brand-black hover:text-white transition-colors"
            >
              Send us your CV
            </a>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-brand-offwhite py-20 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Benefits</span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-black mb-12">
            We take care of our team.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ emoji, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="font-bold text-brand-black mb-1">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-brand-black mb-3">Interested in our mission?</h2>
          <p className="text-gray-500 mb-6">
            Read more about who we are and what we stand for on our About page.
          </p>
          <Link
            href="/about"
            className="inline-block px-8 py-3 border border-brand-black text-brand-black font-semibold rounded-xl hover:bg-brand-black hover:text-white transition-colors"
          >
            Read our story
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
