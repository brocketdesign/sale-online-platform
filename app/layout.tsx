import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { CartProvider } from '@/hooks/useCart'
import Navbar from '@/components/layout/Navbar'
import NavigationProgress from '@/components/layout/NavigationProgress'
import ClickRipple from '@/components/layout/ClickRipple'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Sellify — Sell your digital products online',
    template: '%s | Sellify',
  },
  description: 'The easiest way to sell your digital products online. PDFs, courses, music, software and more.',
  keywords: ['digital products', 'sell online', 'e-commerce', 'digital downloads'],
  openGraph: {
    type: 'website',
    siteName: 'Sellify',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-brand-black antialiased">
        <NavigationProgress />
        <ClickRipple />
        <CartProvider>
          <Navbar />
          <main className="animate-fade-in">{children}</main>
          <Toaster position="bottom-right" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  )
}
