import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@/lib/cartStore'
import { CartDrawer } from './CartDrawer'

describe('CartDrawer', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: true })
  })

  it('shows an empty state when the cart has no items', () => {
    render(<CartDrawer />)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('lists each line with name, size, quantity and price, and a running total', () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 2 }],
      isOpen: true,
    })
    render(<CartDrawer />)
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.getByText('Size 34')).toBeInTheDocument()
    // Line price and grand total are both "KSh 7,000" here since there's only one line.
    expect(screen.getAllByText('KSh 7,000')).toHaveLength(2)
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('removes a line when Remove is clicked', async () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 }],
      isOpen: true,
    })
    render(<CartDrawer />)
    await userEvent.click(screen.getByRole('button', { name: /remove/i }))
    expect(useCartStore.getState().items).toEqual([])
  })

  it('increases quantity when the + stepper is clicked', async () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 }],
      isOpen: true,
    })
    render(<CartDrawer />)
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('includes an Order on WhatsApp link with the cart contents', () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 }],
      isOpen: true,
    })
    render(<CartDrawer />)
    const link = screen.getByRole('link', { name: /order on whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/254714743575'))
    const decoded = decodeURIComponent(link.getAttribute('href')!.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
  })

  it('closes when the close button is clicked', async () => {
    render(<CartDrawer />)
    await userEvent.click(screen.getByRole('button', { name: 'Close cart' }))
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('closes when the overlay backdrop is clicked', async () => {
    render(<CartDrawer />)
    await userEvent.click(screen.getByRole('button', { name: /dismiss cart overlay/i }))
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
