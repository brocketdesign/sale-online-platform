import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateApiKey, createAdminClient } from '@/lib/api-auth'

/** List API keys — session auth only (never via API key for security) */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, is_active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

/** Create a new API key — session auth only. The raw key is returned once and never stored. */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { key, hash, prefix } = generateApiKey()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('api_keys')
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      key_hash: hash,
      key_prefix: prefix,
    })
    .select('id, name, key_prefix, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Return the full raw key ONCE — it will never be retrievable again
  return NextResponse.json({ data: { ...data, key } }, { status: 201 })
}
