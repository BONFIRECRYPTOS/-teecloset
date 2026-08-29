import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from './cartStore'

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
    localStorage.clear()
  })

  it('starts empty and closed', () => {
    expect(useCartStore.getState().items).toEqual([])
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('adds a new item with quantity 1 by default', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    expect(useCartStore.getState().items).toEqual([
      { productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 },
    ])
  })

  it('increments quantity when adding the same product and size again', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    expect(useCartStore.getState().items).toEqual([
      { productSlug: 'espresso-tailored-blazer', size: 34, quantity: 2 },
    ])
  })

  it('treats the same product in a different size as a separate line', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    useCartStore.getState().addItem('espresso-tailored-blazer', 36)
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('removes a line', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    useCartStore.getState().removeItem('espresso-tailored-blazer', 34)
    expect(useCartStore.getState().items).toEqual([])
  })

  it('updates a line quantity', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    useCartStore.getState().updateQuantity('espresso-tailored-blazer', 34, 3)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('removes the line when quantity is updated to 0', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    useCartStore.getState().updateQuantity('espresso-tailored-blazer', 34, 0)
    expect(useCartStore.getState().items).toEqual([])
  })

  it('clears the cart', () => {
    useCartStore.getState().addItem('espresso-tailored-blazer', 34)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toEqual([])
  })

  it('opens and closes the drawer', () => {
    useCartStore.getState().open()
    expect(useCartStore.getState().isOpen).toBe(true)
    useCartStore.getState().close()
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
