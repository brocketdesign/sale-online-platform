'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const loggedOutLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/features', label: 'Features' },
  { href: '/about', label: 'About' },
]

const loggedInLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/library', label: 'Library' },
  { href: '/discover', label: 'Discover' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const navLinks = user ? loggedInLinks : loggedOutLinks

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black tracking-tight text-brand-black hover:opacity-80 transition-opacity shrink-0">
            SellifyStore
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium ml-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  isActive(href)
                    ? 'px-3.5 py-1.5 rounded-full bg-brand-black text-white font-semibold transition-colors'
                    : 'px-3.5 py-1.5 rounded-full text-gray-600 hover:text-brand-black hover:bg-gray-100 transition-colors'
                }
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            {/* Cart */}
            <Link href="/checkout" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF007A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-gray-200 mx-1" />

            {user ? (
              <Link href="/dashboard/profile" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                <User className="w-4 h-4" />
                Account
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-black rounded-lg hover:bg-gray-800 transition-colors">
                  Start selling
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 flex flex-col gap-1 text-sm">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg font-medium ${isActive(href) ? 'bg-brand-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </Link>
            ))}
            <div className="my-2 border-t border-gray-100" />
            {user ? (
              <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg font-medium ${pathname?.startsWith('/dashboard/profile') ? 'bg-brand-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                Account
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="mx-3 mt-1 py-2.5 font-semibold text-white bg-brand-black rounded-lg text-center">Start selling →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}


const marketingLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/features', label: 'Features' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const isDashboard = pathname?.startsWith('/dashboard')

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black tracking-tight text-brand-black hover:opacity-80 transition-opacity shrink-0">
            Sellify
          </Link>

          {/* Desktop nav — marketing links */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium ml-8">
            {marketingLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  isActive(href)
                    ? 'px-3.5 py-1.5 rounded-full bg-brand-black text-white font-semibold transition-colors'
                    : 'px-3.5 py-1.5 rounded-full text-gray-600 hover:text-brand-black hover:bg-gray-100 transition-colors'
                }
              >
                {label}
              </Link>
            ))}
            {user && (
              <>
                <Link href="/dashboard" className={isActive('/dashboard') ? 'px-3.5 py-1.5 rounded-full bg-brand-black text-white font-semibold transition-colors' : 'px-3.5 py-1.5 rounded-full text-gray-600 hover:text-brand-black hover:bg-gray-100 transition-colors'}>
                  Dashboard
                </Link>
                <Link href="/library" className={isActive('/library') ? 'px-3.5 py-1.5 rounded-full bg-brand-black text-white font-semibold transition-colors' : 'px-3.5 py-1.5 rounded-full text-gray-600 hover:text-brand-black hover:bg-gray-100 transition-colors'}>
                  Library
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            {/* Cart */}
            <Link href="/checkout" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF007A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-gray-200 mx-1" />

            {user ? (
              <>
                <Link href="/dashboard/profile" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <User className="w-4 h-4" />
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-black rounded-lg hover:bg-gray-800 transition-colors">
                  Start selling
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 flex flex-col gap-1 text-sm">
            {marketingLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg font-medium ${isActive(href) ? 'bg-brand-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </Link>
            ))}
            <div className="my-2 border-t border-gray-100" />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg font-medium ${isDashboard ? 'bg-brand-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Dashboard</Link>
                <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg font-medium ${pathname?.startsWith('/dashboard/profile') ? 'bg-brand-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Profile &amp; security</Link>
                <Link href="/library" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg font-medium ${isActive('/library') ? 'bg-brand-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Library</Link>
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut() }}
                  className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="mx-3 mt-1 py-2.5 font-semibold text-white bg-brand-black rounded-lg text-center">Start selling →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
