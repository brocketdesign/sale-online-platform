'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-brand-black">Welcome back</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your Sellify account</p>
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
              label="Password"
              type="password"
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#FF007A] font-semibold hover:underline">
              Create one for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
