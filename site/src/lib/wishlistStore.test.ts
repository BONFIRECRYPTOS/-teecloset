import { beforeEach, describe, expect, it } from 'vitest'
import { useWishlistStore } from './wishlistStore'

describe('useWishlistStore', () => {
  beforeEach(() => {
    useWishlistStore.setState({ productIds: [] })
    localStorage.clear()
  })

  it('starts empty', () => {
    expect(useWishlistStore.getState().productIds).toEqual([])
  })

  it('toggles a product into the wishlist', () => {
    useWishlistStore.getState().toggle('p05')
    expect(useWishlistStore.getState().isWishlisted('p05')).toBe(true)
  })

  it('toggles a product out of the wishlist on a second call', () => {
    useWishlistStore.getState().toggle('p05')
    useWishlistStore.getState().toggle('p05')
    expect(useWishlistStore.getState().isWishlisted('p05')).toBe(false)
  })
})
