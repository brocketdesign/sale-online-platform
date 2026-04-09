/**
 * xAI API helpers
 * - Text generation via grok-4
 * - Image generation via grok-imagine-image
 */

const XAI_BASE = 'https://api.x.ai/v1'

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
  }
}

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

/** Generate text with grok. Returns the first choice's message content. */
export async function grokChat(messages: ChatMessage[], temperature = 0.8): Promise<string> {
  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'grok-4',
      messages,
      temperature,
      max_tokens: 400,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`xAI text error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content as string
}

/** Generate an image with grok. Returns the first image URL (b64 JSON or url). */
export async function grokImage(prompt: string): Promise<string> {
  const res = await fetch(`${XAI_BASE}/images/generations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'grok-imagine-image',
      prompt,
      n: 1,
      response_format: 'url',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`xAI image error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.data[0].url as string
}

// ---------------------------------------------------------------------------
// Hero placeholder images – generated once via grok-imagine-image and
// stored permanently in Supabase Storage (assets/hero/).
// ---------------------------------------------------------------------------

export interface HeroPlaceholderImage {
  url: string
  title: string
  seller: string
  price: number
  category: string
}

const SUPABASE_URL = 'https://uvhzhrqqkjdeisfyqsdu.supabase.co/storage/v1/object/public/assets/hero'

export const HERO_PLACEHOLDER_IMAGES: HeroPlaceholderImage[] = [
  { url: `${SUPABASE_URL}/hero-0.jpeg`, title: 'The Fitness Blueprint', seller: 'Alex Morgan', price: 2900, category: 'eBook' },
  { url: `${SUPABASE_URL}/hero-1.jpeg`, title: 'Notion OS 2.0',         seller: 'Jamie Lee',   price: 4700, category: 'Template' },
  { url: `${SUPABASE_URL}/hero-2.jpeg`, title: 'Social Media Mastery',  seller: 'Sam Rivera',  price: 9700, category: 'Course' },
]

export function getHeroPlaceholderImages(): HeroPlaceholderImage[] {
  return HERO_PLACEHOLDER_IMAGES
}
