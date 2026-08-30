import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { Shop } from './Shop'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const testProductRows = [
  {
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
  },
  {
    id: 'p01',
    slug: 'camel-wide-leg-trousers',
    name: 'Camel Wide-Leg Trousers',
    category: 'wide-leg',
    price_ksh: 2800,
    sizes: [28, 30, 32, 34, 36],
    colors: ['Camel'],
    availability: 'in-stock',
    is_new: true,
    is_featured: true,
    description: 'High-waisted wide-leg trousers in a soft camel drape that moves with you.',
    styling_note: 'Pair with a fitted top and heels for the office, or sneakers for a relaxed weekend look.',
    product_images: [{ url: '/products/wide-leg-1.jpg', sort_order: 1 }],
  },
]

/** Builds a chainable, thenable query-builder mock mirroring supabase-js's `.eq()`/`.contains()` filtering. */
function makeProductsQueryBuilder(rows: typeof testProductRows) {
  let filtered = rows
  const builder: Record<string, unknown> = {
    eq: vi.fn((field: string, value: unknown) => {
      filtered = filtered.filter((row) => (row as Record<string, unknown>)[field] === value)
      return builder
    }),
    contains: vi.fn((field: string, value: unknown[]) => {
      filtered = filtered.filter((row) => {
        const rowValue = (row as Record<string, unknown>)[field] as unknown[]
        return rowValue.includes(value[0])
      })
      return builder
    }),
    then: (resolve: (value: { data: typeof rows; error: null }) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: filtered, error: null }).then(resolve, reject),
  }
  return builder
}

function mockSupabase(rows: typeof testProductRows = testProductRows) {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'products') {
      return { select: vi.fn().mockReturnValue(makeProductsQueryBuilder(rows)) }
    }
    const order = vi.fn().mockResolvedValue({
      data: [{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }],
      error: null,
    })
    const select = vi.fn().mockReturnValue({ order })
    return { select }
  })
}

describe('Shop', () => {
  it('filters products by the category in the URL', async () => {
    mockSupabase()
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers']}>
        <Shop />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(await screen.findByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.queryByText('Camel Wide-Leg Trousers')).not.toBeInTheDocument()
  })

  it('shows an empty state when no products match the filters', async () => {
    mockSupabase()
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers&size=26']}>
        <Shop />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(await screen.findByText(/no pieces match those filters/i)).toBeInTheDocument()
  })

  it('shows a loading skeleton before the product data resolves', async () => {
    mockSupabase()
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <Shop />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    })
  })
})
