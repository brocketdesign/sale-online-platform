import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, User, Shield } from 'lucide-react'
import AvatarUpload from './AvatarUpload'
import ProfileForm from './ProfileForm'
import SecuritySection from './SecuritySection'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-brand-black">Profile settings</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Manage your public profile and account security.</p>
          </div>
        </div>

        {/* Public profile */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#FF90E8]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#FF007A]" />
            </div>
            <h2 className="text-lg font-bold text-brand-black">Public profile</h2>
          </div>

          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <AvatarUpload
              currentUrl={profile.avatar_url}
              displayName={profile.display_name ?? profile.username}
            />
            <div>
              <p className="font-semibold text-brand-black">
                {profile.display_name || profile.username}
              </p>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="inline-block mt-2 text-xs text-[#FF007A] hover:underline"
              >
                View public page ↗
              </Link>
            </div>
          </div>

          {/* Profile fields */}
          <ProfileForm
            profile={{
              display_name: profile.display_name,
              username: profile.username,
              bio: profile.bio,
              tagline: profile.tagline,
              website_url: profile.website_url,
              twitter_url: profile.twitter_url,
            }}
          />
        </section>

        {/* Security */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-brand-black">Security</h2>
          </div>
          <SecuritySection currentEmail={user.email ?? ''} />
        </section>

      </div>
    </div>
  )
}
