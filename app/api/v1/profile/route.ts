import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, admin } = auth

  const { data, error } = await admin
    .from('profiles')
    .select('id, username, display_name, bio, tagline, avatar_url, website_url, twitter_url, is_pro, credits, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, admin } = auth
  const body = await request.json()

  const allowed = ['display_name', 'bio', 'tagline', 'avatar_url', 'website_url', 'twitter_url', 'username']
  const updates: Database['public']['Tables']['profiles']['Update'] = {}
  for (const key of allowed) {
    if (key in body) (updates as Record<string, unknown>)[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, username, display_name, bio, tagline, avatar_url, website_url, twitter_url, is_pro, credits, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
