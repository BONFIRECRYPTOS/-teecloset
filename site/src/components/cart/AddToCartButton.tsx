import { useState } from 'react'
import type { Product, Size } from '@/data/types'
import { useCartStore } from '@/lib/cartStore'
import { SizePicker } from '@/components/product/SizePicker'
import { buttonClassName } from '@/components/ui/buttonStyles'

interface AddToCartButtonProps {
  product: Product
  variant?: 'icon' | 'inline'
  selectedSize?: Size
}

export function AddToCartButton({ product, variant = 'icon', selectedSize }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [isPickingSize, setIsPickingSize] = useState(false)

  if (variant === 'inline') {
    return (
      <button
        type="button"
        disabled={!selectedSize}
        onClick={() => selectedSize && addItem(product.slug, selectedSize)}
        className={buttonClassName('secondary', 'mt-3 w-full')}
      >
        Add to Cart
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setIsPickingSize((v) => !v)
        }}
        aria-label={`Add ${product.name} to cart`}
        aria-expanded={isPickingSize}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        </svg>
      </button>
      {isPickingSize && (
        <div className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-sand bg-ivory p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">Select size</p>
          <SizePicker
            sizes={product.sizes}
            onSelect={(size) => {
              addItem(product.slug, size)
              setIsPickingSize(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
