'use client'

import { useCart } from '@/hooks/useCart'
import Button from '@/components/ui/Button'
import { ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Product, Profile } from '@/types/database'

interface Props {
  product: Product
  seller: Profile
  size?: 'sm' | 'md' | 'lg'
}

export default function AddToCartButton({ product, seller, size = 'lg' }: Props) {
  const { items, addItem, removeItem } = useCart()
  const inCart = items.some((i) => i.productId === product.id)

  function handleClick() {
    if (inCart) {
      removeItem(product.id)
      toast.info('Removed from cart')
      return
    }
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
    })
    toast.success('Added to cart!')
  }

  return (
    <Button
      onClick={handleClick}
      size={size}
      fullWidth={size === 'lg'}
      variant={inCart ? 'outline' : 'primary'}
      className={inCart ? '!border-[#FF007A] !text-[#FF007A]' : ''}
    >
      {inCart ? (
        <>
          <Check className="w-4 h-4" />
          In cart — remove
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add to cart
        </>
      )}
    </Button>
  )
}
