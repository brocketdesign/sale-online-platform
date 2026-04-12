import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Look up the user by email (account was auto-created during checkout)
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    console.error('[set-password] listUsers error', listError)
    return NextResponse.json({ error: 'Failed to look up account.' }, { status: 500 })
  }

  const user = listData?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )

  if (!user) {
    return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 })
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password })
  if (updateError) {
    console.error('[set-password] updateUser error', updateError)
    return NextResponse.json({ error: 'Failed to set password. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
