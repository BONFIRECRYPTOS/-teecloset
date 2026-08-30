import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductDetail } from './ProductDetail'

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
    id: 'p06',
    slug: 'camel-oversized-blazer',
    name: 'Camel Oversized Blazer',
    category: 'blazers',
    price_ksh: 3200,
    sizes: [28, 30, 32, 34, 36],
    colors: ['Camel'],
    availability: 'in-stock',
    is_new: false,
    is_featured: true,
    description: 'An oversized camel blazer with clean lines for that quiet-luxury look.',
    styling_note: 'Roll the sleeves and pair with wide-leg trousers for a full monochrome moment.',
    product_images: [{ url: '/products/blazers-1.jpg', sort_order: 1 }],
  },
  {
    id: 'p08',
    slug: 'cream-linen-blazer',
    name: 'Cream Linen Blazer',
    category: 'blazers',
    price_ksh: 3100,
    sizes: [30, 32, 34, 36],
    colors: ['Cream'],
    availability: 'sold',
    is_new: false,
    is_featured: false,
    description: 'A soft cream linen blazer — one of our most-loved one-off pieces.',
    styling_note: 'Was styled beautifully over a black slip dress — check New Stock for the next drop.',
    product_images: [{ url: '/products/blazers-1.jpg', sort_order: 1 }],
  },
]

/** Builds a chainable, thenable query-builder mock mirroring supabase-js's `.eq()`/`.maybeSingle()` filtering. */
function makeProductsQueryBuilder(rows: typeof testProductRows) {
  let filtered = rows
  const builder: Record<string, unknown> = {
    eq: vi.fn((field: string, value: unknown) => {
      filtered = filtered.filter((row) => (row as Record<string, unknown>)[field] === value)
      return builder
    }),
    maybeSingle: vi.fn(() => Promise.resolve({ data: filtered[0] ?? null, error: null })),
    then: (resolve: (value: { data: typeof rows; error: null }) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: filtered, error: null }).then(resolve, reject),
  }
  return builder
}

function mockSupabase(
  categories: { id: string; slug: string; label: string; sort_order: number }[],
  products: typeof testProductRows = testProductRows,
) {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'products') {
      return { select: vi.fn().mockReturnValue(makeProductsQueryBuilder(products)) }
    }
    const order = vi.fn().mockResolvedValue({ data: categories, error: null })
    const select = vi.fn().mockReturnValue({ order })
    return { select }
  })
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:slug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: QueryWrapper },
  )
}

describe('ProductDetail', () => {
  it('renders product name, price, styling note and a WhatsApp order link', async () => {
    mockSupabase([{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }])
    renderAt('/product/espresso-tailored-blazer')
    expect(await screen.findByRole('heading', { name: 'Espresso Tailored Blazer' })).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText(/wear open over a simple tee/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /order on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714743575'),
    )
    expect((await screen.findAllByText('Blazers')).length).toBeGreaterThan(0)
  })

  it('disables ordering for a sold-out product', async () => {
    mockSupabase([])
    renderAt('/product/cream-linen-blazer')
    expect(await screen.findByRole('button', { name: /sold out/i })).toBeDisabled()
  })

  it('renders related products from the same category', async () => {
    mockSupabase([])
    renderAt('/product/espresso-tailored-blazer')
    expect(await screen.findByRole('heading', { name: /you might also like/i })).toBeInTheDocument()
    expect(await screen.findByText('Camel Oversized Blazer')).toBeInTheDocument()
  })

  it('renders NotFound content for an unknown slug', async () => {
    mockSupabase([], [])
    renderAt('/product/does-not-exist')
    expect(await screen.findByText(/404/)).toBeInTheDocument()
  })
})
