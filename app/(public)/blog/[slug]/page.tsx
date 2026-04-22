import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'
import { getBlogPost, blogPosts } from '@/lib/blog-data'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: `${post.title} — Sellify Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.thumbnailUrl }],
    },
  }
}

const categoryColors: Record<string, string> = {
  'Selling tips': 'bg-blue-50 text-blue-700',
  'Creator stories': 'bg-[#FF90E8]/20 text-[#FF007A]',
  'Product updates': 'bg-green-50 text-green-700',
  Platform: 'bg-yellow-50 text-yellow-700',
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  return (
    <>
      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-black transition-colors"
        >
          ← Back to blog
        </Link>
      </div>

      {/* Article header */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${
            categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {post.category}
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-black leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-sm text-gray-400 border-b border-gray-100 pb-6">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
      </header>

      {/* Thumbnail */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      </div>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <p className="text-lg text-gray-700 leading-relaxed mb-10">{post.content.intro}</p>

        {post.content.sections.map((section, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-bold text-brand-black mb-4">{section.heading}</h2>
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-gray-700 leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </section>
        ))}

        <div className="border-t border-gray-100 pt-8 mt-8">
          <p className="text-gray-700 leading-relaxed">{post.content.conclusion}</p>
        </div>
      </article>

      {/* Related posts */}
      <section className="bg-brand-offwhite border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-brand-black mb-8">More from the blog</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {blogPosts
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    <Image
                      src={related.thumbnailUrl}
                      alt={related.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span
                      className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                        categoryColors[related.category] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {related.category}
                    </span>
                    <h3 className="text-base font-bold text-brand-black leading-snug mb-2 group-hover:underline flex-1">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                      <span>{related.date}</span>
                      <span>·</span>
                      <span>{related.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
