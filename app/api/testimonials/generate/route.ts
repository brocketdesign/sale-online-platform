import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { grokChat, grokImage } from '@/lib/xai'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Fetch a temporary image URL (e.g. from xAI), upload it to
 * the `testimonial-assets` Supabase Storage bucket, and return
 * the permanent public URL.
 */
async function uploadGrokImageToStorage(
  supabase: SupabaseClient,
  userId: string,
  tempUrl: string,
  type: 'avatar' | 'background',
): Promise<string> {
  const fetchRes = await fetch(tempUrl)
  if (!fetchRes.ok) {
    throw new Error(`Failed to fetch generated image (${fetchRes.status})`)
  }
  const arrayBuffer = await fetchRes.arrayBuffer()
  const contentType = fetchRes.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg'
  const path = `${userId}/grok-${type}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('testimonial-assets')
    .upload(path, arrayBuffer, { contentType, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage
    .from('testimonial-assets')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service-role client for storage uploads (bypasses RLS, reliable server-side)
  const serviceSupabase = createServiceClient()

  const body = await request.json()
  const { productTitle, productDescription, generateAvatar, generateBackground, avatarGender, avatarEthnicity, avatarAge, language } = body as {
    productTitle: string
    productDescription?: string
    generateAvatar?: boolean
    generateBackground?: boolean
    avatarGender?: string | null
    avatarEthnicity?: string | null
    avatarAge?: string | null
    language?: string | null
  }

  try {
    // Resolve language name for the AI prompt
    const languageNames: Record<string, string> = {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      ja: 'Japanese',
    }
    const targetLanguage = languageNames[language ?? 'en'] ?? 'English'
    const isJapanese = (language ?? 'en') === 'ja'

    // 1. Generate chat message content
    const chatContent = await grokChat([
      {
        role: 'system',
        content:
          `You are generating realistic WhatsApp-style customer testimonials for digital products.
Write a short, authentic-sounding message from a happy customer (2-4 sentences) in ${targetLanguage}.
Include natural excitement, maybe a specific detail they loved.
Use casual language, occasional typos or abbreviations are fine.${isJapanese ? ' Use natural Japanese casual style (e.g. ね、よ、！). The sender name should be a realistic Japanese first name.' : ''}
Also provide: a realistic sender first name, a display time like "14:23", a display date like "${isJapanese ? '今日' : 'Today'}", and 3–5 emoji reactions as a JSON array of {emoji, count} objects (counts 1-12).
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
      const descriptors = [
        avatarGender,
        avatarEthnicity ? `${avatarEthnicity} ethnicity` : null,
        avatarAge ? `aged ${avatarAge}` : null,
      ].filter(Boolean).join(', ')
      const tempAvatarUrl = await grokImage(
        `Realistic profile photo of a ${descriptors ? `${descriptors} person` : `person`} named ${parsed.senderName}. Casual selfie style, friendly smile, natural lighting, cropped to face. No text.`
      )
      result.senderAvatarUrl = await uploadGrokImageToStorage(serviceSupabase, user.id, tempAvatarUrl, 'avatar')
    }

    // 3. Optionally generate background
    if (generateBackground) {
      const tempBgUrl = await grokImage(
        `WhatsApp chat wallpaper background texture. Soft, light, subtle pattern. Pale teal or beige tones. No text, no UI elements, seamless tile.`
      )
      result.backgroundUrl = await uploadGrokImageToStorage(serviceSupabase, user.id, tempBgUrl, 'background')
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
