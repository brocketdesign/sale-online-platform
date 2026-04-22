'use client'

import { useCart } from '@/hooks/useCart'
import Button from '@/components/ui/Button'
import { ShoppingCart } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Product, Profile } from '@/types/database'
import { getTranslations } from '@/lib/i18n'

interface Props {
  product: Product
  seller: Profile
  size?: 'sm' | 'md' | 'lg'
  lang?: string
}

export default function AddToCartButton({ product, seller, size = 'lg', lang }: Props) {
  const { addItem } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = getTranslations(lang)

  function handleClick() {
    const affiliateCode = searchParams.get('ref') ?? undefined
    addItem({
      id: `cart-${product.id}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      bannerUrl: product.banner_url,
      sellerName: seller.display_name || seller.username,
      sellerUsername: seller.username,
      slug: product.slug,
      pageLanguage: (product as any).page_language ?? 'en',
      affiliateCode,
    })
    router.push('/checkout')
  }

  return (
    <Button
      onClick={handleClick}
      size={size}
      fullWidth={size === 'lg'}
      variant="primary"
    >
      <ShoppingCart className="w-4 h-4" />
      {t.addToCart}
    </Button>
  )
}
