import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-black text-white mb-3 block">Sellify</Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The easiest way to sell digital products online. Start earning from what you know.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-gray-400">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Start selling</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/library" className="hover:text-white transition-colors">My Library</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-gray-400">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-gray-400">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><span className="text-gray-500 cursor-default">Terms of Service</span></li>
              <li><span className="text-gray-500 cursor-default">Privacy Policy</span></li>
              <li><span className="text-gray-500 cursor-default">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sellify. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Payments powered by Stripe · Files stored securely
          </p>
        </div>
      </div>
    </footer>
  )
}
