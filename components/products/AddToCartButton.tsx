'use client'

import { useCart } from '@/hooks/useCart'
import Button from '@/components/ui/Button'
import { ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Product, Profile } from '@/types/database'

interface Props {
  product: Product
  seller: Profile
  size?: 'sm' | 'md' | 'lg'
}

export default function AddToCartButton({ product, seller, size = 'lg' }: Props) {
  const { addItem } = useCart()
  const router = useRouter()

  function handleClick() {
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
      Add to cart
    </Button>
  )
}
