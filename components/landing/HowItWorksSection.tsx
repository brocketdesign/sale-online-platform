import { Upload, Globe, Download } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Create your product',
    desc: 'Upload any file — PDF, MP3, video, ZIP. Write a description. Set your price.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Globe,
    number: '02',
    title: 'Share your page',
    desc: 'Get a beautiful, dedicated product page with your branding. Share the link anywhere.',
    color: 'bg-pink-50 text-[#FF007A]',
  },
  {
    icon: Download,
    number: '03',
    title: 'Start earning',
    desc: 'Customers pay securely via Stripe. Files are automatically delivered. You get paid.',
    color: 'bg-green-50 text-green-600',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-brand-black mb-4">
            Three steps to your first sale
          </h2>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            No technical knowledge required. No monthly fees. Start in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gray-200" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center group">
              <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 text-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3`}>
                <step.icon className="w-7 h-7" />
              </div>
              <div className="text-xs font-black tracking-widest text-gray-300 mb-2">{step.number}</div>
              <h3 className="text-xl font-bold text-brand-black mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
