import Link from 'next/link'
import { FileText, Music, Video, Package, Code, Palette, BookOpen, Dumbbell } from 'lucide-react'

const categories = [
  { icon: FileText, label: 'eBooks & PDFs', color: 'bg-blue-100 text-blue-700', format: 'pdf' },
  { icon: Music, label: 'Music & Audio', color: 'bg-purple-100 text-purple-700', format: 'mp3' },
  { icon: Video, label: 'Video & Courses', color: 'bg-red-100 text-red-700', format: 'mp4' },
  { icon: Package, label: 'Templates', color: 'bg-yellow-100 text-yellow-700', format: 'zip' },
  { icon: Code, label: 'Software & Tools', color: 'bg-green-100 text-green-700', format: 'software' },
  { icon: Palette, label: 'Design Assets', color: 'bg-pink-100 text-pink-700', format: 'zip' },
  { icon: BookOpen, label: 'Online Courses', color: 'bg-indigo-100 text-indigo-700', format: 'other' },
  { icon: Dumbbell, label: 'Fitness & Health', color: 'bg-orange-100 text-orange-700', format: 'pdf' },
]

export default function CategorySection() {
  return (
    <section className="py-24 bg-[#f4f0e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-brand-black mb-4">
            Explore the marketplace
          </h2>
          <p className="text-xl text-gray-600">
            Thousands of products across every category.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/discover?format=${cat.format}`}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-2 transition-all duration-300 ease-out group cursor-pointer active:scale-[0.97] active:translate-y-0 active:shadow-none active:duration-100"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center">{cat.label}</span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black text-white font-semibold rounded-xl hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ease-out active:translate-y-0 active:shadow-none active:scale-[0.97] active:duration-100"
          >
            Browse all products →
          </Link>
        </div>
      </div>
    </section>
  )
}
