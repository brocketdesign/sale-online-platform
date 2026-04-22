import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AffiliateDashboardClient from './AffiliateDashboardClient'

export const metadata = { title: 'Affiliate Dashboard' }

export default async function AffiliateDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#f9f8f5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-brand-black">Affiliate Dashboard</h1>
          <p className="text-gray-500 mt-1">Promote products and earn commissions, or manage affiliates for your products.</p>
        </div>
        <AffiliateDashboardClient userId={user.id} />
      </div>
    </div>
  )
}
