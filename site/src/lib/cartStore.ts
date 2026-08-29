import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Size } from '@/data/types'

export interface CartItem {
  productSlug: string
  size: Size
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (productSlug: string, size: Size, quantity?: number) => void
  removeItem: (productSlug: string, size: Size) => void
  updateQuantity: (productSlug: string, size: Size, quantity: number) => void
  clearCart: () => void
  open: () => void
  close: () => void
}

function isSameLine(item: CartItem, productSlug: string, size: Size): boolean {
  return item.productSlug === productSlug && item.size === size
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (productSlug, size, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => isSameLine(item, productSlug, size))
          if (existing) {
            return {
              items: state.items.map((item) =>
                isSameLine(item, productSlug, size) ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            }
          }
          return { items: [...state.items, { productSlug, size, quantity }] }
        }),
      removeItem: (productSlug, size) =>
        set((state) => ({
          items: state.items.filter((item) => !isSameLine(item, productSlug, size)),
        })),
      updateQuantity: (productSlug, size, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => !isSameLine(item, productSlug, size))
              : state.items.map((item) => (isSameLine(item, productSlug, size) ? { ...item, quantity } : item)),
        })),
      clearCart: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'teecloset-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
