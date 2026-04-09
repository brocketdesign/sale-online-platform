import { formatPrice } from '@/lib/utils'

interface PriceTagProps {
  price: number
  currency?: string
  className?: string
}

export default function PriceTag({ price, currency = 'usd', className = '' }: PriceTagProps) {
  const label = price === 0 ? 'Free' : `${formatPrice(price, currency)}+`

  return (
    <span
      className={[
        'inline-flex items-center px-3 py-1 text-sm font-bold text-white rounded-sm',
        'price-tag bg-[#FF007A]',
        className,
      ].join(' ')}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
        paddingRight: '18px',
      }}
    >
      {label}
    </span>
  )
}
