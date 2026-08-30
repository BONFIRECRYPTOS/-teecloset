import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@/lib/cartStore'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { CartDrawer } from './CartDrawer'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const ROW = {
  id: 'p05',
  slug: 'espresso-tailored-blazer',
  name: 'Espresso Tailored Blazer',
  category: 'blazers',
  price_ksh: 3500,
  sizes: [30, 32, 34, 36, 38],
  colors: ['Espresso Black'],
  availability: 'in-stock',
  is_new: true,
  is_featured: true,
  description: 'A sharply tailored espresso blazer that instantly elevates any outfit.',
  styling_note: 'Wear open over a simple tee and jeans, or buttoned for the boardroom.',
  product_images: [{ url: '/products/blazers-1.jpg', sort_order: 1 }],
}

function mockSupabaseProducts(rows: (typeof ROW)[] = [ROW]) {
  const inFn = vi.fn().mockResolvedValue({ data: rows, error: null })
  const select = vi.fn().mockReturnValue({ in: inFn })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('CartDrawer', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: true })
    vi.clearAllMocks()
    mockSupabaseProducts()
  })

  it('shows an empty state when the cart has no items', () => {
    render(<CartDrawer />, { wrapper: QueryWrapper })
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('lists each line with name, size, quantity and price, and a running total', async () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 2 }],
      isOpen: true,
    })
    render(<CartDrawer />, { wrapper: QueryWrapper })
    expect(await screen.findByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.getByText('Size 34')).toBeInTheDocument()
    // Line price and grand total are both "KSh 7,000" here since there's only one line.
    await waitFor(() => expect(screen.getAllByText('KSh 7,000')).toHaveLength(2))
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('removes a line when Remove is clicked', async () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 }],
      isOpen: true,
    })
    render(<CartDrawer />, { wrapper: QueryWrapper })
    await userEvent.click(await screen.findByRole('button', { name: /remove/i }))
    expect(useCartStore.getState().items).toEqual([])
  })

  it('increases quantity when the + stepper is clicked', async () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 }],
      isOpen: true,
    })
    render(<CartDrawer />, { wrapper: QueryWrapper })
    await userEvent.click(await screen.findByRole('button', { name: /increase quantity/i }))
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('includes an Order on WhatsApp link with the cart contents', async () => {
    useCartStore.setState({
      items: [{ productSlug: 'espresso-tailored-blazer', size: 34, quantity: 1 }],
      isOpen: true,
    })
    render(<CartDrawer />, { wrapper: QueryWrapper })
    const link = await screen.findByRole('link', { name: /order on whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/254714743575'))
    const decoded = decodeURIComponent(link.getAttribute('href')!.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
  })

  it('closes when the close button is clicked', async () => {
    render(<CartDrawer />, { wrapper: QueryWrapper })
    await userEvent.click(screen.getByRole('button', { name: 'Close cart' }))
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('closes when the overlay backdrop is clicked', async () => {
    render(<CartDrawer />, { wrapper: QueryWrapper })
    await userEvent.click(screen.getByRole('button', { name: /dismiss cart overlay/i }))
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
