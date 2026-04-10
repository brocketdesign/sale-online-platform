import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import type { Database } from '@/types/database'

/** Generate a new API key. Returns the raw key (shown once), its SHA-256 hash, and display prefix. */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString('hex')
  const key = `sp_${raw}`
  const hash = createHash('sha256').update(key).digest('hex')
  const prefix = key.slice(0, 12) // "sp_" + 9 hex chars
  return { key, hash, prefix }
}

/** Service-role Supabase client — no cookies, bypasses RLS. Only use server-side. */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type AuthResult = {
  userId: string
  admin: ReturnType<typeof createAdminClient>
  /** true when authenticated via API key header, false when via session cookie */
  isApiKey: boolean
}

/**
 * Authenticate a request via API key (Authorization: Bearer sp_...) or Supabase session cookie.
 * Returns null if unauthenticated.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult | null> {
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer sp_')) {
    const token = authHeader.slice(7)
    const keyHash = createHash('sha256').update(token).digest('hex')
    const admin = createAdminClient()

    const { data: apiKey } = await admin
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .maybeSingle()

    if (!apiKey) return null

    // Update last_used_at (non-blocking)
    void admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash)

    return { userId: apiKey.user_id as string, admin, isApiKey: true }
  }

  // Fall back to session cookie auth
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return { userId: user.id, admin: createAdminClient(), isApiKey: false }
}
