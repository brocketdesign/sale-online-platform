'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function PublishToggle({ productId, status }: { productId: string; status: string }) {
  const [current, setCurrent] = useState(status)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = current === 'published' ? 'draft' : 'published'
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ status: next }).eq('id', productId)
    if (error) {
      toast.error('Failed to update status')
    } else {
      setCurrent(next)
      toast.success(next === 'published' ? 'Product published!' : 'Moved to draft')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full transition-all active:scale-[0.93]',
        current === 'published'
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      ].join(' ')}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current === 'published' ? 'bg-green-500' : 'bg-gray-400'}`} />
      {current === 'published' ? 'Published' : 'Draft'}
    </button>
  )
}
