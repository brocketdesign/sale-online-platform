'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Copy, Check, ExternalLink, Link2, TrendingUp, Users, DollarSign, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'

interface AffiliateLink {
  id: string
  code: string
  clicks: number
  created_at: string
  products: {
    id: string
    title: string
    slug: string
    price: number
    currency: string
    affiliate_commission_rate: number
    banner_url: string | null
    profiles: { username: string; display_name: string | null }
  }
}

interface Commission {
  id: string
  commission_amount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  affiliate_link_id: string | null
  product_id: string | null
}

// ── Seller view: products with affiliate stats ─────────────────────────────
interface SellerProduct {
  id: string
  title: string
  slug: string
  price: number
  currency: string
  affiliate_enabled: boolean
  affiliate_commission_rate: number
}

interface SellerAffiliateStat {
  affiliate_id: string
  code: string
  clicks: number
  commission_total: number
  currency: string
  username: string | null
  display_name: string | null
}

interface SellerProductStats {
  product: SellerProduct
  affiliates: SellerAffiliateStat[]
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }
  return { copied, copy }
}

// ── Affiliate Panel ────────────────────────────────────────────────────────
function AffiliatePanel({ userId }: { userId: string }) {
  const supabase = createClient()
  const { copied, copy } = useCopy()
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [linksRes, commissionsRes] = await Promise.all([
      fetch('/api/affiliates/links'),
      supabase
        .from('affiliate_commissions')
        .select(`id, commission_amount, currency, status, created_at, affiliate_link_id, product_id`)
        .eq('affiliate_id', userId)
        .order('created_at', { ascending: false }),
    ])

    if (linksRes.ok) {
      const data = await linksRes.json()
      setLinks(data.links ?? [])
    }
    setCommissions(commissionsRes.data ?? [])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => { load() }, [load])

  async function deleteLink(id: string) {
    setDeleting(id)
    const res = await fetch(`/api/affiliates/links?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Link deleted')
      setLinks(prev => prev.filter(l => l.id !== id))
    } else {
      toast.error('Failed to delete link')
    }
    setDeleting(null)
  }

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0)

  // Group pending commissions by currency for multi-currency display
  const pendingByCurrency = commissions
    .filter(c => c.status === 'pending')
    .reduce<Record<string, number>>((acc, c) => {
      const cur = (c.currency ?? 'usd').toLowerCase()
      acc[cur] = (acc[cur] ?? 0) + c.commission_amount
      return acc
    }, {})
  const pendingCurrencies = Object.entries(pendingByCurrency)
    .sort((a, b) => b[1] - a[1])
    .map(([currency, amount]) => ({ currency, formatted: formatPrice(amount, currency) }))
  const pendingDisplay = pendingCurrencies.length > 0 ? pendingCurrencies : [{ currency: 'usd', formatted: '$0.00' }]

  // Group total earned (non-cancelled) by currency
  const earnedByCurrency = commissions
    .filter(c => c.status !== 'cancelled')
    .reduce<Record<string, number>>((acc, c) => {
      const cur = (c.currency ?? 'usd').toLowerCase()
      acc[cur] = (acc[cur] ?? 0) + c.commission_amount
      return acc
    }, {})
  const earnedCurrencies = Object.entries(earnedByCurrency)
    .sort((a, b) => b[1] - a[1])
    .map(([currency, amount]) => formatPrice(amount, currency))

  if (loading) return <div className="py-12 text-center text-gray-400">Loading...</div>

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Link2} color="bg-blue-50 text-blue-600" label="Active links" value={String(links.length)} />
        <StatCard icon={TrendingUp} color="bg-purple-50 text-purple-600" label="Total clicks" value={String(totalClicks)} />
        <StatCard icon={DollarSign} color="bg-green-50 text-green-600" label="Pending balance" currencies={pendingDisplay} />
      </div>

      {/* My affiliate links */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Affiliate Links</h2>
          <span className="text-xs text-gray-400">{links.length} link{links.length !== 1 ? 's' : ''}</span>
        </div>

        {links.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            You don&apos;t have any affiliate links yet.<br />
            Browse products to find ones with an affiliate program.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {links.map(link => {
              const origin = typeof window !== 'undefined' ? window.location.origin : ''
              const url = `${origin}/${link.products.profiles.username}/${link.products.slug}?ref=${link.code}`
              const commission = Math.round(link.products.price * link.products.affiliate_commission_rate / 100)
              return (
                <li key={link.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{link.products.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by {link.products.profiles.display_name ?? link.products.profiles.username} ·{' '}
                      {link.products.affiliate_commission_rate}% commission ({formatPrice(commission, link.products.currency)} / sale) ·{' '}
                      {link.clicks} click{link.clicks !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-1 flex items-center gap-1 max-w-full">
                      <span className="text-xs text-gray-500 truncate font-mono">{url}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-brand-magenta rounded-lg hover:bg-gray-50">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copy(url, link.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 transition-colors"
                    >
                      {copied === link.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === link.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLink(link.id)}
                      disabled={deleting === link.id}
                      className="p-2 text-gray-300 hover:text-red-400 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Commission history */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Commission History</h2>
          <span className="text-xs text-gray-400">
            Total earned:{' '}
            {earnedCurrencies.length > 0 ? earnedCurrencies.join(' + ') : '$0.00'}
          </span>
        </div>

        {commissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">No commissions yet. Share your links to start earning!</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {commissions.map(c => (
              <li key={c.id} className="px-6 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Sale</p>
                  <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'paid' ? 'bg-green-50 text-green-700' :
                    c.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {c.status}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(c.commission_amount, c.currency)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// ── Seller Panel ───────────────────────────────────────────────────────────
function SellerPanel({ userId }: { userId: string }) {
  const supabase = createClient()
  const [stats, setStats] = useState<SellerProductStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Fetch seller products with affiliate enabled
      const { data: products } = await supabase
        .from('products')
        .select('id, title, slug, price, currency, affiliate_enabled, affiliate_commission_rate')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (!products?.length) { setLoading(false); return }

      // For each product, fetch affiliate links + commissions
      const statsArr: SellerProductStats[] = await Promise.all(
        (products as SellerProduct[]).map(async product => {
          const { data: links } = await supabase
            .from('affiliate_links')
            .select(`id, code, clicks, affiliate_id, profiles!affiliate_links_affiliate_id_fkey(username, display_name)`)
            .eq('product_id', product.id)

          const affiliates: SellerAffiliateStat[] = await Promise.all(
            (links ?? []).map(async (link: any) => {
              const { data: comms } = await supabase
                .from('affiliate_commissions')
                .select('commission_amount, currency')
                .eq('affiliate_link_id', link.id)
                .neq('status', 'cancelled')

              const commission_total = (comms ?? []).reduce((s: number, c: any) => s + c.commission_amount, 0)
              const currency = comms?.[0]?.currency ?? product.currency

              return {
                affiliate_id: link.affiliate_id,
                code: link.code,
                clicks: link.clicks,
                commission_total,
                currency,
                username: link.profiles?.username ?? null,
                display_name: link.profiles?.display_name ?? null,
              }
            })
          )

          return { product, affiliates }
        })
      )

      setStats(statsArr)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) return <div className="py-12 text-center text-gray-400">Loading...</div>

  const enabledProducts = stats.filter(s => s.product.affiliate_enabled)
  const totalAffiliates = new Set(stats.flatMap(s => s.affiliates.map(a => a.affiliate_id))).size

  // Group commissions issued by currency for multi-currency display
  const issuedByCurrency = stats
    .flatMap(s => s.affiliates)
    .reduce<Record<string, number>>((acc, a) => {
      const cur = (a.currency ?? 'usd').toLowerCase()
      acc[cur] = (acc[cur] ?? 0) + a.commission_total
      return acc
    }, {})
  const issuedCurrencies = Object.entries(issuedByCurrency)
    .sort((a, b) => b[1] - a[1])
    .map(([currency, amount]) => ({ currency, formatted: formatPrice(amount, currency) }))
  const issuedDisplay = issuedCurrencies.length > 0 ? issuedCurrencies : [{ currency: 'usd', formatted: '$0.00' }]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Link2} color="bg-blue-50 text-blue-600" label="Products with affiliation" value={String(enabledProducts.length)} />
        <StatCard icon={Users} color="bg-purple-50 text-purple-600" label="Active affiliates" value={String(totalAffiliates)} />
        <StatCard icon={DollarSign} color="bg-red-50 text-red-600" label="Total commissions issued" currencies={issuedDisplay} />
      </div>

      {/* Products list */}
      {stats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          You have no products yet.<br />
          Enable affiliation on a product from the product editor.
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map(({ product, affiliates }) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-gray-900">{product.title}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.affiliate_enabled
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.affiliate_enabled ? `${product.affiliate_commission_rate}% commission` : 'Affiliation off'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{affiliates.length} affiliate{affiliates.length !== 1 ? 's' : ''}</span>
              </div>

              {!product.affiliate_enabled ? (
                <div className="px-6 py-4 text-sm text-gray-400">
                  Enable affiliation in the product editor to let others promote this product.
                </div>
              ) : affiliates.length === 0 ? (
                <div className="px-6 py-4 text-sm text-gray-400">
                  No affiliates yet. Share your product to attract promoters.
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {affiliates.map(a => (
                    <li key={a.code} className="px-6 py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {a.display_name ?? a.username ?? 'Unknown user'}
                        </p>
                        <p className="text-xs text-gray-400">Code: <span className="font-mono">{a.code}</span> · {a.clicks} click{a.clicks !== 1 ? 's' : ''}</p>
                      </div>
                      <span className="font-semibold text-sm text-gray-900">
                        {formatPrice(a.commission_total, a.currency)} earned
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, color, label, value, currencies,
}: {
  icon: React.ElementType
  color: string
  label: string
  value?: string
  currencies?: Array<{ currency: string; formatted: string }>
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        {currencies ? (
          <div className="space-y-1 mt-0.5">
            {currencies.map(({ currency, formatted }) => (
              <div key={currency} className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-mono leading-none shrink-0">
                  {currency}
                </span>
                <span className="text-xl font-black text-gray-900 leading-none">{formatted}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-black text-gray-900">{value}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

// ── Browse affiliate-enabled products panel ────────────────────────────────
function BrowseProductsPanel({ userId }: { userId: string }) {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [joined, setJoined] = useState<Set<string>>(new Set())
  const { copied, copy } = useCopy()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select(`id, title, slug, price, currency, affiliate_commission_rate, banner_url, profiles!products_seller_id_fkey(username, display_name)`)
        .eq('status', 'published')
        .eq('affiliate_enabled', true)
        .neq('seller_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      setProducts(data ?? [])

      // Check which ones the user already joined
      const { data: existing } = await supabase
        .from('affiliate_links')
        .select('product_id, code')
        .eq('affiliate_id', userId)

      const joinedSet = new Set<string>((existing ?? []).map((l: any) => l.product_id))
      setJoined(joinedSet)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function joinProgram(productId: string) {
    setJoining(productId)
    const res = await fetch('/api/affiliates/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    if (res.ok) {
      const { code } = await res.json()
      toast.success('Affiliate link created!')
      setJoined(prev => new Set([...prev, productId]))
      // Copy link to clipboard
      const product = products.find(p => p.id === productId)
      if (product) {
        const url = `${window.location.origin}/${product.profiles.username}/${product.slug}?ref=${code}`
        copy(url, `join-${productId}`)
      }
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed to join')
    }
    setJoining(null)
  }

  if (loading) return <div className="py-12 text-center text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No affiliate programs available yet.
        </div>
      ) : (
        products.map(p => {
          const commission = Math.round(p.price * p.affiliate_commission_rate / 100)
          const isJoined = joined.has(p.id)
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  by {p.profiles.display_name ?? p.profiles.username} ·{' '}
                  {formatPrice(p.price, p.currency)} · {p.affiliate_commission_rate}% commission ({formatPrice(commission, p.currency)} / sale)
                </p>
              </div>
              <div className="shrink-0">
                {isJoined ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                    <Check className="w-3.5 h-3.5" /> Joined
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => joinProgram(p.id)}
                    loading={joining === p.id}
                  >
                    Get affiliate link
                  </Button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────
type Tab = 'my-links' | 'seller' | 'browse'

export default function AffiliateDashboardClient({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>('my-links')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'my-links', label: 'My Links & Earnings' },
    { id: 'browse', label: 'Browse Programs' },
    { id: 'seller', label: 'My Products' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-brand-black shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === 'my-links' && <AffiliatePanel userId={userId} />}
      {tab === 'browse' && <BrowseProductsPanel userId={userId} />}
      {tab === 'seller' && <SellerPanel userId={userId} />}
    </div>
  )
}
