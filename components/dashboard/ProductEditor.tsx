'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Product, ProductFormat, ProductStatus } from '@/types/database'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(2, 'Slug required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be 0 or more'),
  currency: z.string().min(1),
  product_format: z.enum(['pdf', 'mp3', 'mp4', 'epub', 'zip', 'software', 'other'] as const),
  conversion_message: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published'] as const),
})

type FormValues = z.infer<typeof schema>

interface Props {
  mode: 'create' | 'edit'
  product?: Product
  sellerId: string
}

const FORMAT_OPTIONS: { value: ProductFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF / E-book' },
  { value: 'epub', label: 'EPUB' },
  { value: 'mp3', label: 'Audio (MP3)' },
  { value: 'mp4', label: 'Video (MP4)' },
  { value: 'zip', label: 'ZIP / Archive' },
  { value: 'software', label: 'Software' },
  { value: 'other', label: 'Other' },
]

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'CAD', label: 'CAD – Canadian Dollar' },
  { value: 'AUD', label: 'AUD – Australian Dollar' },
]

export default function ProductEditor({ mode, product, sellerId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string>(product?.banner_url ?? '')
  const [productFiles, setProductFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<Array<{ id: string; file_name: string; file_url: string }>>(
    []
  )
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product?.title ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      price: product ? product.price / 100 : 0,
      currency: product?.currency ?? 'USD',
      product_format: (product?.product_format as ProductFormat) ?? 'pdf',
      conversion_message: product?.conversion_message ?? '',
      tags: product?.tags?.join(', ') ?? '',
      status: (product?.status as ProductStatus) ?? 'draft',
    },
  })

  const titleValue = watch('title')

  function handleTitleBlur() {
    if (mode === 'create' && titleValue && !watch('slug')) {
      setValue('slug', slugify(titleValue), { shouldValidate: true })
    }
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  function handleProductFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setProductFiles(prev => [...prev, ...files])
  }

  function removeNewFile(index: number) {
    setProductFiles(prev => prev.filter((_, i) => i !== index))
  }

  function removeExistingFile(id: string) {
    setRemovedFileIds(prev => [...prev, id])
    setExistingFiles(prev => prev.filter(f => f.id !== id))
  }

  async function uploadBanner(productId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${sellerId}/${productId}/banner.${ext}`
    const { error } = await supabase.storage.from('product-banners').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('product-banners').getPublicUrl(path)
    return data.publicUrl
  }

  async function uploadProductFile(productId: string, file: File): Promise<{ path: string; name: string; size: number }> {
    const path = `${sellerId}/${productId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('product-files').upload(path, file)
    if (error) throw error
    return { path, name: file.name, size: file.size }
  }

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setSaving(true)
      try {
        const tags = values.tags
          ? values.tags
              .split(',')
              .map(t => t.trim().toLowerCase())
              .filter(Boolean)
          : []

        const payload = {
          title: values.title,
          slug: values.slug,
          description: values.description,
          price: Math.round(values.price * 100),
          currency: values.currency,
          product_format: values.product_format,
          conversion_message: values.conversion_message ?? null,
          tags,
          status: values.status,
          seller_id: sellerId,
          banner_url: product?.banner_url ?? null,
        }

        let productId: string
        if (mode === 'create') {
          const { data, error } = await supabase
            .from('products')
            .insert(payload)
            .select('id')
            .single()
          if (error) throw error
          productId = data.id
        } else {
          const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', product!.id)
          if (error) throw error
          productId = product!.id
        }

        // Upload banner if changed
        let bannerUrl = product?.banner_url ?? null
        if (bannerFile) {
          bannerUrl = await uploadBanner(productId, bannerFile)
          await supabase.from('products').update({ banner_url: bannerUrl }).eq('id', productId)
        }

        // Remove deleted files
        for (const id of removedFileIds) {
          await supabase.from('product_files').delete().eq('id', id)
        }

        // Upload new product files
        for (const file of productFiles) {
          const uploaded = await uploadProductFile(productId, file)
          await supabase.from('product_files').insert({
            product_id: productId,
            file_name: uploaded.name,
            file_url: uploaded.path,
            file_size: uploaded.size,
          })
        }

        toast.success(mode === 'create' ? 'Product created!' : 'Product updated!')
        router.push('/dashboard/products')
        router.refresh()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Something went wrong'
        toast.error(msg)
      } finally {
        setSaving(false)
      }
    },
    [mode, product, sellerId, bannerFile, productFiles, removedFileIds, router, supabase]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl" data-color-mode="light">
      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Product Title"
          placeholder="My Awesome E-book"
          error={errors.title?.message}
          {...register('title', { onBlur: handleTitleBlur })}
        />
        <Input
          label="URL Slug"
          placeholder="my-awesome-ebook"
          hint="Used in: yourstore.com/you/slug"
          error={errors.slug?.message}
          {...register('slug')}
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <MDEditor
              value={field.value}
              onChange={v => field.onChange(v ?? '')}
              height={300}
              preview="edit"
            />
          )}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Price + Currency + Format */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          placeholder="9.99"
          hint="Enter 0 for free"
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
            {...register('currency')}
          >
            {CURRENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
            {...register('product_format')}
          >
            {FORMAT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversion message */}
      <Input
        label="Conversion Message"
        placeholder="e.g. 'Trusted by 500+ designers'"
        hint="Short badge shown near the buy button"
        {...register('conversion_message')}
      />

      {/* Tags */}
      <Input
        label="Tags"
        placeholder="design, productivity, ux"
        hint="Comma-separated tags for discoverability"
        {...register('tags')}
      />

      {/* Status */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          className="w-48 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
          {...register('status')}
        >
          <option value="draft">Draft (not visible)</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Banner Image */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <ImageIcon className="w-4 h-4 inline mr-1" /> Cover / Banner Image
        </label>
        {bannerPreview && (
          <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-gray-100 max-w-lg">
            <img src={bannerPreview} alt="Banner preview" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => { setBannerPreview(''); setBannerFile(null) }}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-600">
          <Upload className="w-4 h-4" />
          {bannerPreview ? 'Replace image' : 'Upload cover image'}
          <input type="file" accept="image/*" className="sr-only" onChange={handleBannerChange} />
        </label>
      </div>

      {/* Product Files */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <FileText className="w-4 h-4 inline mr-1" /> Product Files
        </label>

        {existingFiles.length > 0 && (
          <ul className="space-y-1">
            {existingFiles.map(f => (
              <li key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                <span className="truncate text-gray-700">{f.file_name}</span>
                <button
                  type="button"
                  onClick={() => removeExistingFile(f.id)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {productFiles.length > 0 && (
          <ul className="space-y-1">
            {productFiles.map((f, i) => (
              <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream border border-brand-pink/20 text-sm">
                <span className="truncate text-gray-700">{f.name}</span>
                <button type="button" onClick={() => removeNewFile(i)} className="ml-2 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-600">
          <Upload className="w-4 h-4" />
          Add files
          <input type="file" multiple className="sr-only" onChange={handleProductFilesChange} />
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={saving}>
          {mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/dashboard/products')}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
