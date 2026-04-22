import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'
import { blogPosts } from '@/lib/blog-data'

export const metadata: Metadata = {
  title: 'Blog — Sellify',
  description: 'Tips, stories, and insights for digital creators. Learn how to build, grow, and earn from your work.',
}

const categories = ['All', 'Selling tips', 'Creator stories', 'Product updates', 'Platform']

const posts = blogPosts

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
            <div className="hidden md:block relative min-h-[320px]">
              <Image
                src={featured.thumbnailUrl}
                alt={featured.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
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
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="relative w-full aspect-video bg-gray-100">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-7 flex flex-col flex-1">
                <span
                  className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${
                    categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-brand-black leading-snug mb-3 group-hover:underline flex-1">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
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
