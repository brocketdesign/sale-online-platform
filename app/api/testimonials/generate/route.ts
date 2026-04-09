import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { grokChat, grokImage } from '@/lib/xai'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { productTitle, productDescription, generateAvatar, generateBackground } = body as {
    productTitle: string
    productDescription?: string
    generateAvatar?: boolean
    generateBackground?: boolean
  }

  try {
    // 1. Generate chat message content
    const chatContent = await grokChat([
      {
        role: 'system',
        content:
          `You are generating realistic WhatsApp-style customer testimonials for digital products. 
Write a short, authentic-sounding message from a happy customer (2-4 sentences). 
Include natural excitement, maybe a specific detail they loved. 
Use casual language, occasional typos or abbreviations are fine.
Also provide: a realistic sender first name, a display time like "14:23", a display date like "Today", and 3–5 emoji reactions as a JSON array of {emoji, count} objects (counts 1-12).
Respond ONLY with valid JSON in this exact shape:
{
  "senderName": "...",
  "message": "...",
  "displayTime": "...",
  "displayDate": "...",
  "reactions": [{"emoji":"❤️","count":7}, ...]
}`,
      },
      {
        role: 'user',
        content: `Product: "${productTitle}"${productDescription ? `\nDescription: ${productDescription.slice(0, 300)}` : ''}`,
      },
    ])

    let parsed: {
      senderName: string
      message: string
      displayTime: string
      displayDate: string
      reactions: Array<{ emoji: string; count: number }>
    }

    // Strip markdown code fences if present
    const clean = chatContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    parsed = JSON.parse(clean)

    const result: Record<string, unknown> = {
      senderName: parsed.senderName,
      message: parsed.message,
      displayTime: parsed.displayTime,
      displayDate: parsed.displayDate,
      reactions: parsed.reactions,
    }

    // 2. Optionally generate avatar
    if (generateAvatar) {
      const avatarUrl = await grokImage(
        `Realistic profile photo of a person named ${parsed.senderName}. Casual selfie style, friendly smile, natural lighting, cropped to face. No text.`
      )
      result.senderAvatarUrl = avatarUrl
    }

    // 3. Optionally generate background
    if (generateBackground) {
      const bgUrl = await grokImage(
        `WhatsApp chat wallpaper background texture. Soft, light, subtle pattern. Pale teal or beige tones. No text, no UI elements, seamless tile.`
      )
      result.backgroundUrl = bgUrl
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
