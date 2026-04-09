'use client'

import { useActionState, useState, useTransition } from 'react'
import { changeEmail, sendPasswordReset } from './actions'
import { Loader2, CheckCircle2, AlertCircle, KeyRound, Mail } from 'lucide-react'

type Result = { error?: string; success?: boolean; message?: string } | null

function PasswordResetCard({ currentEmail }: { currentEmail: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<Result>(null)

  function handleReset() {
    startTransition(async () => {
      const r = await sendPasswordReset()
      setResult(r)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-brand-black">Password</h3>
          <p className="text-sm text-gray-500 mt-1">
            We&apos;ll send a reset link to{' '}
            <span className="font-medium text-gray-700">{currentEmail}</span>.
          </p>
          {result?.error && (
            <div className="flex items-center gap-2 mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {result.error}
            </div>
          )}
          {result?.success && (
            <div className="flex items-center gap-2 mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Reset link sent — check your inbox.
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending || result?.success === true}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Send reset link
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailCard({ currentEmail }: { currentEmail: string }) {
  const [emailState, emailFormAction, emailPending] = useActionState(changeEmail, null as Result)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FF90E8]/20 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-[#FF007A]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-brand-black">Email address</h3>
          <p className="text-sm text-gray-500 mt-1">
            Current: <span className="font-medium text-gray-700">{currentEmail}</span>
          </p>

          {emailState?.error && (
            <div className="flex items-center gap-2 mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {emailState.error}
            </div>
          )}
          {emailState?.success && (
            <div className="flex items-center gap-2 mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {emailState.message}
            </div>
          )}

          <form action={emailFormAction} className="mt-4 flex gap-2">
            <input
              name="email"
              type="email"
              placeholder="new@email.com"
              required
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A]"
            />
            <button
              type="submit"
              disabled={emailPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {emailPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Change email
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SecuritySection({ currentEmail }: { currentEmail: string }) {
  return (
    <div className="space-y-6">
      <PasswordResetCard currentEmail={currentEmail} />
      <EmailCard currentEmail={currentEmail} />
    </div>
  )
}
