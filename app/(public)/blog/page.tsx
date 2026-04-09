import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Blog — Sellify',
  description: 'Tips, stories, and insights for digital creators. Learn how to build, grow, and earn from your work.',
}

const categories = ['All', 'Selling tips', 'Creator stories', 'Product updates', 'Platform']

const posts = [
  {
    slug: 'how-to-price-digital-products',
    category: 'Selling tips',
    title: 'How to price your digital products (without underselling yourself)',
    excerpt:
      'Pricing is one of the hardest decisions creators face. Too low and you leave money on the table; too high and buyers hesitate. Here\u2019s a framework that works.',
    date: 'April 3, 2026',
    readTime: '6 min read',
    featured: true,
  },
  {
    slug: 'creators-who-quit-day-jobs',
    category: 'Creator stories',
    title: '10 creators who quit their day jobs selling digital products',
    excerpt:
      'From designers to musicians to fitness coaches — real stories of people who turned their knowledge into income and never looked back.',
    date: 'March 28, 2026',
    readTime: '8 min read',
    featured: false,
  },
  {
    slug: 'guide-selling-ebooks-2026',
    category: 'Selling tips',
    title: 'The complete guide to selling ebooks in 2026',
    excerpt:
      'Writing the book is only half the work. Learn how to format, price, market, and deliver your ebook so readers love buying it.',
    date: 'March 20, 2026',
    readTime: '10 min read',
    featured: false,
  },
  {
    slug: 'pay-what-you-want-pricing',
    category: 'Selling tips',
    title: 'Why pay-what-you-want pricing works better than you think',
    excerpt:
      'Giving buyers control over price sounds scary, but the data tells a different story. Discover how to use flexible pricing to grow faster.',
    date: 'March 14, 2026',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'product-description-that-converts',
    category: 'Selling tips',
    title: 'How to write a product description that actually converts',
    excerpt:
      'Most product pages lose buyers in the first three seconds. Learn the copywriting techniques that turn browsers into customers.',
    date: 'March 7, 2026',
    readTime: '7 min read',
    featured: false,
  },
  {
    slug: 'building-audience-before-launch',
    category: 'Selling tips',
    title: 'Building an audience before you launch your first product',
    excerpt:
      "Your first sale shouldn't be a surprise. Here's how to attract the right people before your product is even ready.",
    date: 'February 27, 2026',
    readTime: '9 min read',
    featured: false,
  },
  {
    slug: 'best-digital-product-ideas-2026',
    category: 'Selling tips',
    title: '25 digital product ideas you can create this weekend',
    excerpt:
      "No audience? No problem. These low-effort, high-value product ideas work even if you're just starting out.",
    date: 'February 19, 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    slug: 'sellify-platform-update-q1-2026',
    category: 'Product updates',
    title: "What's new in Sellify — Q1 2026",
    excerpt:
      "New analytics dashboard, bulk discount codes, and a redesigned product page experience. Here's everything that shipped this quarter.",
    date: 'February 10, 2026',
    readTime: '4 min read',
    featured: false,
  },
]

const categoryColors: Record<string, string> = {
  'Selling tips': 'bg-blue-50 text-blue-700',
  'Creator stories': 'bg-[#FF90E8]/20 text-[#FF007A]',
  'Product updates': 'bg-green-50 text-green-700',
  Platform: 'bg-yellow-50 text-yellow-700',
}

export default function BlogPage() {
  const [featured, ...rest] = posts

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-offwhite border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-brand-black mb-5">
            The Sellify Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Tips, stories, and insights for digital creators. Written by people who sell online every day.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group block mb-16 rounded-3xl bg-brand-black text-white overflow-hidden hover:opacity-95 transition-opacity"
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-pink mb-4">
                Featured · {featured.category}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4 group-hover:underline">
                {featured.title}
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime}</span>
              </div>
            </div>
            <div className="hidden md:block bg-gradient-to-br from-[#FF007A]/20 to-brand-pink/20 min-h-[320px]" />
          </div>
        </Link>

        {/* Category filter (static for now) */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                cat === 'All'
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-brand-black bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span
                className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${
                  categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {post.category}
              </span>
              <h3 className="text-lg font-bold text-brand-black leading-snug mb-3 group-hover:underline">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{post.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-brand-offwhite border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-black text-brand-black mb-3">Get creator tips in your inbox</h2>
          <p className="text-gray-500 mb-8">New posts every week. No spam, ever. Unsubscribe anytime.</p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
