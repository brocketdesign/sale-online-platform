#!/usr/bin/env node
/**
 * scripts/generate-blog-content.ts
 *
 * For each blog post:
 *  1. Generates a thumbnail via xAI image generation
 *  2. Uploads the thumbnail to Supabase Storage (bucket: assets, path: blog/<slug>.jpeg)
 *  3. Generates full article content via xAI grok chat
 *  4. Writes the complete data to lib/blog-data.ts
 *
 * Usage:
 *   npx tsx scripts/generate-blog-content.ts
 */

import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '..', '.env') })
config({ path: path.resolve(__dirname, '..', '.env.local'), override: true })

/* ─── Config ──────────────────────────────────────────────────────────────── */
const XAI_KEY = process.env.X_AI_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STORAGE_BUCKET = 'assets'
const STORAGE_FOLDER = 'blog'
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${STORAGE_FOLDER}`

if (!XAI_KEY) { console.error('❌  X_AI_API_KEY is not set'); process.exit(1) }
if (!SUPABASE_URL) { console.error('❌  NEXT_PUBLIC_SUPABASE_URL is not set'); process.exit(1) }
if (!SUPABASE_SERVICE_KEY) { console.error('❌  SUPABASE_SERVICE_ROLE_KEY is not set'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

/* ─── Blog posts (same as blog/page.tsx) ─────────────────────────────────── */
const posts = [
  {
    slug: 'how-to-price-digital-products',
    category: 'Selling tips',
    title: 'How to price your digital products (without underselling yourself)',
    excerpt: 'Pricing is one of the hardest decisions creators face. Too low and you leave money on the table; too high and buyers hesitate. Here\'s a framework that works.',
    date: 'April 3, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'creators-who-quit-day-jobs',
    category: 'Creator stories',
    title: '10 creators who quit their day jobs selling digital products',
    excerpt: 'From designers to musicians to fitness coaches — real stories of people who turned their knowledge into income and never looked back.',
    date: 'March 28, 2026',
    readTime: '8 min read',
  },
  {
    slug: 'guide-selling-ebooks-2026',
    category: 'Selling tips',
    title: 'The complete guide to selling ebooks in 2026',
    excerpt: 'Writing the book is only half the work. Learn how to format, price, market, and deliver your ebook so readers love buying it.',
    date: 'March 20, 2026',
    readTime: '10 min read',
  },
  {
    slug: 'pay-what-you-want-pricing',
    category: 'Selling tips',
    title: 'Why pay-what-you-want pricing works better than you think',
    excerpt: 'Giving buyers control over price sounds scary, but the data tells a different story. Discover how to use flexible pricing to grow faster.',
    date: 'March 14, 2026',
    readTime: '5 min read',
  },
  {
    slug: 'product-description-that-converts',
    category: 'Selling tips',
    title: 'How to write a product description that actually converts',
    excerpt: 'Most product pages lose buyers in the first three seconds. Learn the copywriting techniques that turn browsers into customers.',
    date: 'March 7, 2026',
    readTime: '7 min read',
  },
  {
    slug: 'building-audience-before-launch',
    category: 'Selling tips',
    title: 'Building an audience before you launch your first product',
    excerpt: "Your first sale shouldn't be a surprise. Here's how to attract the right people before your product is even ready.",
    date: 'February 27, 2026',
    readTime: '9 min read',
  },
  {
    slug: 'best-digital-product-ideas-2026',
    category: 'Selling tips',
    title: '25 digital product ideas you can create this weekend',
    excerpt: "No audience? No problem. These low-effort, high-value product ideas work even if you're just starting out.",
    date: 'February 19, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'sellify-platform-update-q1-2026',
    category: 'Product updates',
    title: "What's new in Sellify — Q1 2026",
    excerpt: "New analytics dashboard, bulk discount codes, and a redesigned product page experience. Here's everything that shipped this quarter.",
    date: 'February 10, 2026',
    readTime: '4 min read',
  },
]

/* ─── xAI helpers ─────────────────────────────────────────────────────────── */

interface ArticleSection { heading: string; paragraphs: string[] }
interface ArticleContent { intro: string; sections: ArticleSection[]; conclusion: string }

async function generateThumbnail(title: string, category: string): Promise<Buffer> {
  const prompt = `A professional blog thumbnail illustration for a digital products marketplace article. Topic: "${title}". Category: ${category}. Style: modern, clean, flat design with vibrant gradient colors, abstract geometric shapes, no people, no text, suitable for a professional blog. Aspect ratio 16:9.`

  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-imagine-image',
      prompt,
      n: 1,
      response_format: 'b64_json',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`xAI image error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const b64 = data.data[0].b64_json as string
  return Buffer.from(b64, 'base64')
}

async function generateArticleContent(post: typeof posts[0]): Promise<ArticleContent> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional content writer for Sellify, a digital products marketplace. Write engaging, practical blog posts aimed at creators who sell digital products online. Return ONLY valid JSON, no markdown fences, no extra text.`,
        },
        {
          role: 'user',
          content: `Write a full blog article for this post:
Title: "${post.title}"
Category: ${post.category}
Summary: "${post.excerpt}"

Return a JSON object with this exact structure:
{
  "intro": "Opening paragraph (2-3 sentences that hook the reader)",
  "sections": [
    { "heading": "Section title", "paragraphs": ["paragraph 1", "paragraph 2"] },
    ...3 to 5 sections total
  ],
  "conclusion": "Closing paragraph with a call-to-action relevant to Sellify"
}

Make the content practical, specific, and around ${post.readTime.split(' ')[0]} minutes of reading (~${parseInt(post.readTime) * 200} words total).`,
        },
      ],
      temperature: 0.75,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`xAI chat error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw = data.choices[0].message.content as string

  // Strip potential markdown fences if model adds them despite instructions
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  return JSON.parse(cleaned) as ArticleContent
}

async function uploadToSupabase(slug: string, imageBuffer: Buffer): Promise<string> {
  const filePath = `${STORAGE_FOLDER}/${slug}.jpeg`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw new Error(`Supabase upload error: ${error.message}`)

  return `${PUBLIC_BASE}/${slug}.jpeg`
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

interface BlogPostData {
  slug: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
  thumbnailUrl: string
  content: ArticleContent
}

async function main() {
  const results: BlogPostData[] = []

  for (const post of posts) {
    console.log(`\n📝 Processing: ${post.slug}`)

    // 1. Generate thumbnail
    console.log('  🎨 Generating thumbnail...')
    let thumbnailUrl = `${PUBLIC_BASE}/${post.slug}.jpeg`
    try {
      const imageBuffer = await generateThumbnail(post.title, post.category)
      console.log('  ☁️  Uploading thumbnail to Supabase...')
      thumbnailUrl = await uploadToSupabase(post.slug, imageBuffer)
      console.log(`  ✅ Thumbnail: ${thumbnailUrl}`)
    } catch (err) {
      console.warn(`  ⚠️  Thumbnail generation failed, using placeholder URL: ${err}`)
    }

    // 2. Generate article content
    console.log('  ✍️  Generating article content...')
    let content: ArticleContent
    try {
      content = await generateArticleContent(post)
      console.log(`  ✅ Content generated (${content.sections.length} sections)`)
    } catch (err) {
      console.warn(`  ⚠️  Content generation failed, using fallback: ${err}`)
      content = {
        intro: post.excerpt,
        sections: [
          {
            heading: 'Getting started',
            paragraphs: [
              'This topic is one of the most important things a digital creator needs to understand.',
              'By focusing on the key principles outlined here, you\'ll be better equipped to succeed in the digital marketplace.',
            ],
          },
        ],
        conclusion: 'Start applying these insights today on Sellify and watch your digital product business grow.',
      }
    }

    results.push({ ...post, thumbnailUrl, content })

    // Avoid rate limiting
    await new Promise(r => setTimeout(r, 1500))
  }

  // 3. Write to lib/blog-data.ts
  const outPath = path.resolve(__dirname, '..', 'lib', 'blog-data.ts')
  const fileContent = `// AUTO-GENERATED by scripts/generate-blog-content.ts
// Re-run the script to regenerate thumbnails and content.

export interface ArticleSection {
  heading: string
  paragraphs: string[]
}

export interface ArticleContent {
  intro: string
  sections: ArticleSection[]
  conclusion: string
}

export interface BlogPost {
  slug: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
  thumbnailUrl: string
  featured?: boolean
  content: ArticleContent
}

export const blogPosts: BlogPost[] = ${JSON.stringify(results, null, 2)}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}
`

  fs.writeFileSync(outPath, fileContent, 'utf-8')
  console.log(`\n✅ Done! Data written to lib/blog-data.ts`)
  console.log(`   ${results.length} posts processed`)
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
