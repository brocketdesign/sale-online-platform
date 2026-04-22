'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error('Delete failed')
    } else {
      toast.success('Product deleted')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className={[
        'p-2 rounded-lg transition-all text-xs active:scale-[0.93]',
        confirming
          ? 'bg-red-500 text-white px-3'
          : 'text-gray-400 hover:text-red-600 hover:bg-red-50',
      ].join(' ')}
      title="Delete"
    >
      {confirming ? 'Confirm?' : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
