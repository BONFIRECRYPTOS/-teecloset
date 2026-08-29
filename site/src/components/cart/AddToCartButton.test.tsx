import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@/lib/cartStore'
import { getProductBySlug } from '@/data/products'
import { AddToCartButton } from './AddToCartButton'

const product = getProductBySlug('espresso-tailored-blazer')!

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
