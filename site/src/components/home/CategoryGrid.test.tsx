import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { CategoryGrid } from './CategoryGrid'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const testProductRows = [
  {
    id: 'p1',
    slug: 'test-blazer',
    name: 'Test Blazer',
    category: 'blazers',
    price_ksh: 3500,
    sizes: [30, 32, 34],
    colors: ['Black'],
    availability: 'in-stock',
    is_new: true,
    is_featured: false,
    description: 'A test blazer.',
    styling_note: 'Style it well.',
    product_images: [{ url: '/products/test-blazer.jpg', sort_order: 1 }],
  },
]

function mockSupabase() {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'products') {
      return { select: vi.fn().mockResolvedValue({ data: testProductRows, error: null }) }
    }
    const order = vi.fn().mockResolvedValue({
      data: [
        { id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 },
        { id: '2', slug: 'palazzo', label: 'Palazzo Pants', sort_order: 2 },
      ],
      error: null,
    })
    const select = vi.fn().mockReturnValue({ order })
    return { select }
  })
}

describe('CategoryGrid', () => {
  it('links every category to its filtered shop URL', async () => {
    mockSupabase()
    render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(await screen.findByRole('link', { name: /blazers/i })).toHaveAttribute(
      'href',
      '/shop?category=blazers',
    )
    expect(screen.getByRole('link', { name: /palazzo pants/i })).toHaveAttribute(
      'href',
      '/shop?category=palazzo',
    )
  })

  it('renders the cover image for a category from its first product', async () => {
    mockSupabase()
    const { container } = render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    await screen.findByRole('link', { name: /blazers/i })
    await waitFor(() => {
      expect(container.querySelector('img')).toHaveAttribute('src', '/products/test-blazer.jpg')
    })
  })

  it('renders the branded fallback for a category with no products/images instead of a blank tile', async () => {
    mockSupabase()
    render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    // 'palazzo' has no matching product in testProductRows, so it has no cover image.
    const palazzoLink = await screen.findByRole('link', { name: /palazzo pants/i })
    await waitFor(() => {
      expect(palazzoLink.querySelector('img')).toBeNull()
      expect(palazzoLink).toHaveTextContent('TC')
    })
  })
})
