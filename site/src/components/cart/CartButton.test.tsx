import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@/lib/cartStore'
import { CartButton } from './CartButton'

describe('CartButton', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
  })

  it('opens the cart drawer when clicked', async () => {
    render(<CartButton />)
    await userEvent.click(screen.getByRole('button', { name: /open cart/i }))
    expect(useCartStore.getState().isOpen).toBe(true)
  })

  it('shows the total item count as a badge', () => {
    useCartStore.setState({
      items: [
        { productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 },
        { productSlug: 'ivory-wrap-top', size: 30, quantity: 2 },
      ],
      isOpen: false,
    })
    render(<CartButton />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
