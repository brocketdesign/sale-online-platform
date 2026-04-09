'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Star } from 'lucide-react'

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().min(10, 'Please write at least 10 characters').max(2000),
})

type FormValues = z.infer<typeof schema>

interface Props {
  productId: string
  onSuccess?: () => void
}

export default function ReviewForm({ productId, onSuccess }: Props) {
  const supabase = createClient()
  const [hovered, setHovered] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, title: '', body: '' },
  })

  const rating = watch('rating')

  async function onSubmit(values: FormValues) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in to leave a review')
      return
    }

    // Check if the user actually purchased this product
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('product_id', productId)
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (!purchase) {
      toast.error('You must purchase this product before reviewing it')
      return
    }

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      reviewer_id: user.id,
      rating: values.rating,
      title: values.title,
      body: values.body,
      verified_buyer: true,
    })

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already reviewed this product')
      } else {
        toast.error('Failed to submit review')
      }
      return
    }

    toast.success('Review submitted!')
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900">Leave a Review</h3>

      {/* Star rating picker */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setValue('rating', star, { shouldValidate: true })}
              className="focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hovered || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="text-xs text-red-500">Please select a rating</p>}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Review Title</label>
        <input
          {...register('title')}
          placeholder="Summarise your experience"
          className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Body */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Review</label>
        <textarea
          {...register('body')}
          rows={4}
          placeholder="Tell others about your experience with this product..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta resize-none"
        />
        {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting}>
        Submit Review
      </Button>
    </form>
  )
}
