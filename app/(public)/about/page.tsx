import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About — Sellify',
  description: "We're on a mission to make selling digital products simple, fair, and accessible to every creator on the planet.",
}

const values = [
  {
    title: 'Creators first',
    desc: "Every product decision starts with one question: does this help creators earn more? If the answer is no, we don't build it.",
  },
  {
    title: 'Radical simplicity',
    desc: 'Complexity is a tax. We remove friction at every step — from setup to checkout to payout. Simple should be the default.',
  },
  {
    title: 'Transparent by default',
    desc: "One fee. No fine print. You know exactly what you'll earn before you hit publish. We'll never change that without notice.",
  },
  {
    title: 'Global from day one',
    desc: 'Creators exist everywhere. We support multiple currencies and ship tax compliance in every region where we operate.',
  },
]

const stats = [
  { value: '50,000+', label: 'Active sellers' },
  { value: '$12M+', label: 'Paid out to creators' },
  { value: '180+', label: 'Countries' },
  { value: '4.9 / 5', label: 'Average seller rating' },
]

const team = [
  {
    name: 'Maya Chen',
    role: 'Co-founder & CEO',
    bio: 'Former product lead at Stripe. Sold her first digital product (a Figma UI kit) before founding Sellify.',
    avatar: 'MC',
    avatarBg: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Luca Ferreira',
    role: 'Co-founder & CTO',
    bio: 'Previously at Cloudflare. Obsessed with edge-fast delivery and zero-downtime infrastructure.',
    avatar: 'LF',
    avatarBg: 'bg-[#FF90E8]/30 text-[#FF007A]',
  },
  {
    name: 'Aisha Okafor',
    role: 'Head of Product',
    bio: 'Creator economy researcher turned PM. Author of "The Digital Creator Playbook" — sold on Sellify, of course.',
    avatar: 'AO',
    avatarBg: 'bg-yellow-100 text-yellow-700',
  },
  {
    name: 'James Park',
    role: 'Head of Design',
    bio: 'Designed for Notion and Linear. Believes great software should feel like it was built for you personally.',
    avatar: 'JP',
    avatarBg: 'bg-green-100 text-green-700',
  },
  {
    name: 'Sofia Müller',
    role: 'Head of Growth',
    bio: 'Helped scale two creator-economy startups to 8-figure ARR. She runs a travel photography newsletter on the side.',
    avatar: 'SM',
    avatarBg: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Alex Kim',
    role: 'Head of Support',
    bio: "If something's broken, Alex already knows. Obsessed with sub-one-hour response times.",
    avatar: 'AK',
    avatarBg: 'bg-orange-100 text-orange-700',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            We believe creators<br className="hidden sm:block" /> deserve better tools.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Sellify was built because existing platforms were too expensive, too complicated, or both.
            We set out to fix that — and we're just getting started.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Our story</span>
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-5">
            <p>
              In 2023, Maya tried to sell a Figma UI kit she had been building for years. Setting up
              a store took three days. Payment processing required four separate tools. The first
              month's fees exceeded her revenue. She asked Luca to help her build something simpler.
            </p>
            <p>
              Six months later, Sellify was live. A year in, we had processed our first million
              dollars in creator earnings. Today, thousands of writers, designers, developers,
              educators, and artists use Sellify every day to turn their skills into income.
            </p>
            <p>
              Our mission is straightforward: make it as easy as possible for anyone, anywhere,
              to sell what they know and earn a fair living doing it. The 10% fee isn't just a
              business model — it's a commitment. When you win, we win. That alignment matters.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-offwhite border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl sm:text-5xl font-black text-brand-black mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">What we stand for</span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-black mb-12">Our values</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map(({ title, desc }) => (
              <div key={title} className="border-l-4 border-brand-black pl-6">
                <h3 className="font-bold text-brand-black text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-brand-offwhite py-20 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">The team</span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-black mb-12">
            Built by creators, for creators.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(({ name, role, bio, avatar, avatarBg }) => (
              <div key={name} className="bg-white rounded-2xl p-7 border border-gray-100">
                <div className={`w-12 h-12 rounded-full ${avatarBg} font-bold text-sm flex items-center justify-center mb-5`}>
                  {avatar}
                </div>
                <div className="font-bold text-brand-black">{name}</div>
                <div className="text-sm text-gray-400 mb-3">{role}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring callout */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-brand-black mb-3">We're hiring</h2>
          <p className="text-gray-500 mb-6">
            Want to help build the best platform for digital creators? We'd love to hear from you.
          </p>
          <Link
            href="/careers"
            className="inline-block px-8 py-3 bg-brand-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            See open roles
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
