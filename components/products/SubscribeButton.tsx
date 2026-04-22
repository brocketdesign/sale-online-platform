'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Bell } from 'lucide-react'

export default function SubscribeButton({ sellerId, sellerName }: { sellerId: string; sellerName: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('email_subscribers')
      .upsert({ seller_id: sellerId, email }, { onConflict: 'seller_id,email' })
    if (error) {
      toast.error('Could not subscribe. Try again.')
    } else {
      setSubscribed(true)
      toast.success(`Subscribed to ${sellerName}!`)
    }
    setLoading(false)
  }

  if (subscribed) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
        <Bell className="w-4 h-4" /> Subscribed!
      </span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-brand-black text-brand-black text-sm font-semibold rounded-lg hover:bg-brand-black hover:text-white transition-all active:scale-[0.96]"
      >
        <Bell className="w-4 h-4" />
        Subscribe
      </button>
    )
  }

  return (
    <form onSubmit={handleSubscribe} className="flex items-center gap-2">
      <input
        type="email"
        required
        autoFocus
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF007A] w-56"
      />
      <Button type="submit" size="sm" loading={loading}>Subscribe</Button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
    </form>
  )
}
