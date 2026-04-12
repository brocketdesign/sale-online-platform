'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  email: string
}

export default function SetPasswordRedirect({ email }: Props) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/set-password?email=${encodeURIComponent(email)}`)
    }, 1800)
    return () => clearTimeout(timer)
  }, [email, router])

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md w-full">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-brand-black mb-2">Payment Successful!</h1>
      <p className="text-gray-500 mb-2">
        A confirmation has been sent to <strong>{email}</strong>.
      </p>
      <p className="text-gray-400 text-sm">Setting up your account…</p>
    </div>
  )
}
