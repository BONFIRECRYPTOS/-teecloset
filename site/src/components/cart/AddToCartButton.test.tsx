import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@/lib/cartStore'
import type { Product } from '@/data/types'
import { AddToCartButton } from './AddToCartButton'

const product: Product = {
  id: 'p05',
  slug: 'espresso-tailored-blazer',
  name: 'Espresso Tailored Blazer',
  category: 'blazers',
  priceKsh: 3500,
  sizes: [30, 32, 34, 36, 38],
  colors: ['Espresso Black'],
  availability: 'in-stock',
  isNew: true,
  isFeatured: true,
  description: 'A sharply tailored espresso blazer that instantly elevates any outfit.',
  stylingNote: 'Wear open over a simple tee and jeans, or buttoned for the boardroom.',
  images: ['/products/blazers-1.jpg', '/products/blazers-2.jpg'],
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
  })

  it('icon variant opens a size picker, then adds the chosen size to the cart', async () => {
    render(<AddToCartButton product={product} />)
    await userEvent.click(screen.getByRole('button', { name: /add espresso tailored blazer to cart/i }))
    await userEvent.click(screen.getByRole('button', { name: '34' }))
    expect(useCartStore.getState().items).toEqual([
      { productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 },
    ])
  })

  it('inline variant is disabled until a size is provided, then adds it on click', async () => {
    const { rerender } = render(<AddToCartButton product={product} variant="inline" />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled()

    rerender(<AddToCartButton product={product} variant="inline" selectedSize={36} />)
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(useCartStore.getState().items).toEqual([
      { productSlug: 'espresso-tailored-blazer', size: 36, quantity: 1 },
    ])
  })
})
