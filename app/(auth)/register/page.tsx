'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      toast.error('Username must be 3-30 chars, lowercase letters, numbers, hyphens or underscores')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      toast.error('That username is already taken')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || username },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Update the auto-created profile with user's chosen username
      await supabase
        .from('profiles')
        .update({ username, display_name: displayName || username })
        .eq('id', data.user.id)
    }

    toast.success('Account created! Check your email to confirm.')
    router.push('/login')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-brand-black">Start selling today</h1>
            <p className="text-gray-500 mt-2 text-sm">Free to sign up. No monthly fees.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Username"
              type="text"
              required
              placeholder="yourname"
              hint="3-30 chars. Letters, numbers, hyphens, underscores."
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
            <Input
              label="Display name"
              type="text"
              placeholder="Your Name or Brand"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Create account →
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-400">
            By signing up you agree to our terms of service and privacy policy.
          </p>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF007A] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
