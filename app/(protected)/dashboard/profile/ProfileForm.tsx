'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Profile = {
  display_name: string | null
  username: string
  bio: string | null
  tagline: string | null
  website_url: string | null
  twitter_url: string | null
}

type State = { error?: string; success?: boolean } | null

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null as State)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
          <input
            name="display_name"
            defaultValue={profile.display_name ?? ''}
            placeholder="Your full name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 select-none">@</span>
            <input
              name="username"
              defaultValue={profile.username}
              placeholder="yourhandle"
              required
              pattern="[a-z0-9_\-]{3,30}"
              className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
        <input
          name="tagline"
          defaultValue={profile.tagline ?? ''}
          placeholder="Short headline about you"
          maxLength={100}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ''}
          placeholder="Tell buyers about yourself…"
          rows={3}
          maxLength={500}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A] resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
          <input
            name="website_url"
            type="url"
            defaultValue={profile.website_url ?? ''}
            placeholder="https://yoursite.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Twitter / X</label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 select-none">x.com/</span>
            <input
              name="twitter_url"
              defaultValue={profile.twitter_url?.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '') ?? ''}
              placeholder="handle"
              className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/40 focus:border-[#FF007A]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-2.5 bg-brand-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Save profile
      </button>
    </form>
  )
}
