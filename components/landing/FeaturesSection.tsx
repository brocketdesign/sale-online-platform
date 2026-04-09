import { FileText, Music, Video, Package, Tag, Heart, Star, Lock } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Sell anything digital',
    desc: 'PDFs, eBooks, audio, video, courses, software, templates, art — if it\'s a file, you can sell it.',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    icon: Tag,
    title: 'Pay what you want',
    desc: 'Set a minimum price of $0 and let customers decide what your work is worth to them.',
    bg: 'bg-[#FF90E8]/10',
    color: 'text-[#FF007A]',
  },
  {
    icon: Heart,
    title: 'Give as a gift',
    desc: "Send a product as a gift with a personal message. Perfect for special occasions.",
    bg: 'bg-red-50',
    color: 'text-red-500',
  },
  {
    icon: Star,
    title: 'Ratings & reviews',
    desc: 'Build trust with verified buyer ratings. Social proof that converts browsers into buyers.',
    bg: 'bg-yellow-50',
    color: 'text-yellow-600',
  },
  {
    icon: Lock,
    title: 'Secure file delivery',
    desc: 'Files are stored securely in the cloud. Buyers get time-limited download links.',
    bg: 'bg-green-50',
    color: 'text-green-600',
  },
  {
    icon: Package,
    title: 'Upsells built in',
    desc: 'Checkout automatically suggests your other products, increasing your average order value.',
    bg: 'bg-purple-50',
    color: 'text-purple-600',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-[#f4f0e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-brand-black mb-4">
            Everything you need to sell
          </h2>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            A complete platform. No plugins, no extensions, no limits.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-brand-black mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
