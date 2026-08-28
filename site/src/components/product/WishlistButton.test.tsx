import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWishlistStore } from '@/lib/wishlistStore'
import { WishlistButton } from './WishlistButton'

describe('WishlistButton', () => {
  beforeEach(() => useWishlistStore.setState({ productIds: [] }))

  it('toggles wishlist state on click', async () => {
    render(<WishlistButton productId="p05" />)
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    await userEvent.click(button)
    expect(screen.getByRole('button', { name: /remove from wishlist/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
