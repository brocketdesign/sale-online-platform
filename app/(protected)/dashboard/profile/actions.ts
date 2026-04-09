'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const display_name = (formData.get('display_name') as string).trim()
  const username = (formData.get('username') as string).trim()
  const bio = (formData.get('bio') as string).trim()
  const tagline = (formData.get('tagline') as string).trim()
  const website_url = (formData.get('website_url') as string).trim()
  const twitter_url = (formData.get('twitter_url') as string).trim()

  if (!username) return { error: 'Username is required' }
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return { error: 'Username must be 3–30 characters: lowercase letters, numbers, _ or -' }
  }

  // Check username uniqueness (excluding self)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) return { error: 'Username is already taken' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name, username, bio, tagline, website_url, twitter_url })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function sendPasswordReset() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'No email associated with this account' }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback?next=/dashboard/profile/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function changeEmail(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const newEmail = (formData.get('email') as string).trim().toLowerCase()
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return { error: 'Enter a valid email address' }
  }
  if (newEmail === user.email) return { error: 'That is already your current email' }

  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) return { error: error.message }

  return { success: true, message: 'Check both your old and new inbox to confirm the change.' }
}
