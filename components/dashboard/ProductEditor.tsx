'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
import { Upload, X, FileText, Image as ImageIcon, Eye } from 'lucide-react'

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
  show_sales_count: z.boolean(),
  sales_count: z.number().int().min(0),
  preview_enabled: z.boolean(),
  preview_page_count: z.number().int().min(1).max(10),
  preview_blur: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  mode: 'create' | 'edit'
  product?: Product
  sellerId: string
  isAdmin?: boolean
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

export default function ProductEditor({ mode, product, sellerId, isAdmin = false }: Props) {
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

  // PDF preview state
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfPreviewName, setPdfPreviewName] = useState<string>('')
  const previewObjectUrlRef = useRef<string | null>(null)

  // Page preview images state
  const [previewImages, setPreviewImages] = useState<Array<{ id: string; image_url: string; sort_order: number }>>([])
  const [newPreviewImageFiles, setNewPreviewImageFiles] = useState<File[]>([])
  const [newPreviewImagePreviews, setNewPreviewImagePreviews] = useState<string[]>([])
  const [removedPreviewImageIds, setRemovedPreviewImageIds] = useState<string[]>([])

  // Load existing product files on edit
  useEffect(() => {
    if (mode !== 'edit' || !product?.id) return
    supabase
      .from('product_files')
      .select('id, file_name, file_url')
      .eq('product_id', product.id)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) {
          toast.error('Could not load product files')
          return
        }
        setExistingFiles(data ?? [])
      })
  }, [mode, product?.id, supabase])

  // Load existing preview images on edit
  useEffect(() => {
    if (mode !== 'edit' || !product?.id) return
    supabase
      .from('product_preview_images')
      .select('id, image_url, sort_order')
      .eq('product_id', product.id)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) {
          toast.error('Could not load preview images')
          return
        }
        setPreviewImages(data ?? [])
      })
  }, [mode, product?.id, supabase])

  // Clean up preview object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
      }
      newPreviewImagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function closePdfPreview() {
    setPdfPreviewUrl(null)
    setPdfPreviewName('')
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }
  }

  async function previewExistingPdf(file: { id: string; file_name: string; file_url: string }) {
    const { data, error } = await supabase.storage
      .from('product-files')
      .createSignedUrl(file.file_url, 300)
    if (error || !data) {
      toast.error('Could not generate preview link')
      return
    }
    setPdfPreviewName(file.file_name)
    setPdfPreviewUrl(data.signedUrl)
  }

  function previewNewPdf(file: File) {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    previewObjectUrlRef.current = url
    setPdfPreviewName(file.name)
    setPdfPreviewUrl(url)
  }

  function handlePreviewImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const previews = files.map(f => URL.createObjectURL(f))
    setNewPreviewImageFiles(prev => [...prev, ...files])
    setNewPreviewImagePreviews(prev => [...prev, ...previews])
  }

  function removeNewPreviewImage(index: number) {
    URL.revokeObjectURL(newPreviewImagePreviews[index])
    setNewPreviewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  function removeExistingPreviewImage(id: string) {
    setRemovedPreviewImageIds(prev => [...prev, id])
    setPreviewImages(prev => prev.filter(img => img.id !== id))
  }

  async function uploadPreviewImage(productId: string, file: File, index: number): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${sellerId}/${productId}/preview-${Date.now()}-${index}.${ext}`
    const { error } = await supabase.storage.from('product-previews').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('product-previews').getPublicUrl(path)
    return data.publicUrl
  }

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
      show_sales_count: product?.show_sales_count ?? false,
      sales_count: product?.sales_count ?? 0,
      preview_enabled: (product as any)?.preview_enabled ?? false,
      preview_page_count: (product as any)?.preview_page_count ?? 3,
      preview_blur: (product as any)?.preview_blur ?? false,
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
          show_sales_count: values.show_sales_count,
          sales_count: values.sales_count,
          preview_enabled: values.preview_enabled,
          preview_page_count: values.preview_page_count,
          preview_blur: values.preview_blur,
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

        // Remove deleted preview images
        for (const id of removedPreviewImageIds) {
          await supabase.from('product_preview_images').delete().eq('id', id)
        }

        // Upload new preview images
        for (let i = 0; i < newPreviewImageFiles.length; i++) {
          const file = newPreviewImageFiles[i]
          const imageUrl = await uploadPreviewImage(productId, file, i)
          await supabase.from('product_preview_images').insert({
            product_id: productId,
            image_url: imageUrl,
            sort_order: previewImages.length + i,
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
    [mode, product, sellerId, bannerFile, productFiles, removedFileIds, newPreviewImageFiles, removedPreviewImageIds, previewImages, router, supabase]
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

      {/* Sales Count */}
      {isAdmin && (
      <div className="space-y-3 rounded-xl border border-gray-200 p-5 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Show Sales Count</label>
            <p className="text-xs text-gray-500 mt-0.5">Display a &ldquo;X sales&rdquo; badge on the product page</p>
          </div>
          <Controller
            name="show_sales_count"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 ${
                  field.value ? 'bg-brand-magenta' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    field.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
          />
        </div>
        {watch('show_sales_count') && (
          <Input
            label="Number of Sales to Display"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            hint="The exact number shown to visitors"
            error={errors.sales_count?.message}
            {...register('sales_count', { valueAsNumber: true })}
          />
        )}
      </div>
      )}

      {/* Page Preview Section */}
      <div className="space-y-4 rounded-xl border border-gray-200 p-5 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Show Page Previews</label>
            <p className="text-xs text-gray-500 mt-0.5">Let visitors preview sample pages before buying</p>
          </div>
          <Controller
            name="preview_enabled"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 ${
                  field.value ? 'bg-brand-magenta' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    field.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
          />
        </div>

        {watch('preview_enabled') && (
          <div className="space-y-4 pt-2 border-t border-gray-200">
            {/* Page count + blur row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Number of pages */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Number of Pages to Show</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 focus:border-brand-magenta"
                  {...register('preview_page_count', { valueAsNumber: true })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n} page{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Blur toggle */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Display Style</label>
                <Controller
                  name="preview_blur"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                          !field.value
                            ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                          field.value
                            ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Blurry
                      </button>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Preview image uploads */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Preview Images</label>
              <p className="text-xs text-gray-500">Upload images of the pages you want to preview. They will be shown in order.</p>

              {/* Existing preview images */}
              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {previewImages.map((img, idx) => (
                    <div key={img.id} className="relative group w-24 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={img.image_url} alt={`Preview page ${idx + 1}`} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeExistingPreviewImage(img.id)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* New preview images to upload */}
              {newPreviewImagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {newPreviewImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group w-24 h-32 rounded-lg overflow-hidden border border-brand-pink/30 bg-brand-cream">
                      <img src={preview} alt={`New preview ${idx + 1}`} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeNewPreviewImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-brand-magenta/80 text-white text-xs rounded px-1">New</span>
                    </div>
                  ))}
                </div>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                Add preview images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handlePreviewImagesChange}
                />
              </label>
            </div>
          </div>
        )}
      </div>

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
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {f.file_name.toLowerCase().endsWith('.pdf') && (
                    <button
                      type="button"
                      title="Preview PDF"
                      onClick={() => previewExistingPdf(f)}
                      className="text-gray-400 hover:text-brand-magenta"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingFile(f.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {productFiles.length > 0 && (
          <ul className="space-y-1">
            {productFiles.map((f, i) => (
              <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream border border-brand-pink/20 text-sm">
                <span className="truncate text-gray-700">{f.name}</span>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {f.name.toLowerCase().endsWith('.pdf') && (
                    <button
                      type="button"
                      title="Preview PDF"
                      onClick={() => previewNewPdf(f)}
                      className="text-gray-400 hover:text-brand-magenta"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => removeNewFile(i)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closePdfPreview}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <span className="text-sm font-medium text-gray-700 truncate">{pdfPreviewName}</span>
              <button
                type="button"
                onClick={closePdfPreview}
                className="text-gray-500 hover:text-gray-800 ml-4 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={pdfPreviewUrl}
              className="flex-1 w-full"
              title={pdfPreviewName}
            />
          </div>
        </div>
      )}
    </form>
  )
}
