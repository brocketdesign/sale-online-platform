'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Accordion from '@/components/ui/Accordion'
import { FILE_FORMAT_LABELS } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most recent' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest rated' },
]

const FORMAT_OPTIONS = Object.entries(FILE_FORMAT_LABELS).map(([value, label]) => ({ value, label }))

interface ProductFiltersProps {
  totalCount: number
  availableTags: string[]
}

export default function ProductFilters({ totalCount, availableTags }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('q', searchInput || null)
  }

  function toggleTag(tag: string) {
    const current = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag]
    updateParam('tags', next.length ? next.join(',') : null)
  }

  function toggleFormat(format: string) {
    const current = searchParams.get('format')?.split(',').filter(Boolean) ?? []
    const next = current.includes(format)
      ? current.filter((f) => f !== format)
      : [...current, format]
    updateParam('format', next.length ? next.join(',') : null)
  }

  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
  const activeFormats = searchParams.get('format')?.split(',').filter(Boolean) ?? []
  const sort = searchParams.get('sort') ?? 'newest'
  const minPrice = searchParams.get('min_price') ?? ''
  const maxPrice = searchParams.get('max_price') ?? ''

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-4 font-medium">
        {totalCount.toLocaleString()} {totalCount === 1 ? 'product' : 'products'}
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#FF007A] focus:ring-1 focus:ring-[#FF007A]/30"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); updateParam('q', null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </form>

      {/* Sort */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort by</label>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#FF007A]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <Accordion title="Tags" defaultOpen>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={[
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  activeTags.includes(tag)
                    ? 'bg-[#FF007A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ].join(' ')}
              >
                {tag}
              </button>
            ))}
          </div>
        </Accordion>
      )}

      {/* File type */}
      <Accordion title="File type" defaultOpen>
        <div className="space-y-1.5">
          {FORMAT_OPTIONS.map((f) => (
            <label key={f.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeFormats.includes(f.value)}
                onChange={() => toggleFormat(f.value)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-[#FF007A] focus:ring-[#FF007A]"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{f.label}</span>
            </label>
          ))}
        </div>
      </Accordion>

      {/* Price range */}
      <Accordion title="Price range">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => updateParam('min_price', e.target.value || null)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF007A]"
            />
          </div>
          <span className="text-gray-400 text-sm">–</span>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => updateParam('max_price', e.target.value || null)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF007A]"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => { updateParam('min_price', null); updateParam('max_price', null) }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
          <button
            onClick={() => updateParam('min_price', '0')}
            className="text-xs text-[#FF007A] hover:underline"
          >
            Free only
          </button>
        </div>
      </Accordion>
    </div>
  )
}
