'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createContext, useContext, type ReactNode } from 'react'
import type { CartItem } from '@/types/database'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const exists = get().items.find((i) => i.productId === item.productId)
        if (!exists) {
          set((state) => ({ items: [...state.items, item] }))
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.length,
      subtotal: () => get().items.reduce((sum, item) => sum + item.price, 0),
    }),
    { name: 'sellify-cart' }
  )
)

// Context wrapper to silence SSR hydration
const CartContext = createContext<null>(null)
export function CartProvider({ children }: { children: ReactNode }) {
  return <CartContext.Provider value={null}>{children}</CartContext.Provider>
}
