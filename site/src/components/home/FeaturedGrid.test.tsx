import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { FeaturedGrid } from './FeaturedGrid'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const testProducts = [
  {
    id: 'p1',
    slug: 'test-featured-blazer',
    name: 'Test Featured Blazer',
    category: 'blazers',
    price_ksh: 3500,
    sizes: [30, 32, 34],
    colors: ['Black'],
    availability: 'in-stock',
    is_new: false,
    is_featured: true,
    description: 'A test blazer.',
    styling_note: 'Style it well.',
    product_images: [{ url: '/products/test-blazer.jpg', sort_order: 1 }],
  },
]

function mockSupabase() {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'products') {
      return { select: vi.fn().mockResolvedValue({ data: testProducts, error: null }) }
    }
    const order = vi.fn().mockResolvedValue({ data: [], error: null })
    const select = vi.fn().mockReturnValue({ order })
    return { select }
  })
}

describe('FeaturedGrid', () => {
  it('renders a Featured Picks heading and product cards', async () => {
    mockSupabase()
    render(
      <MemoryRouter>
        <FeaturedGrid />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(await screen.findByRole('heading', { name: /featured picks/i })).toBeInTheDocument()
    expect((await screen.findAllByRole('link')).length).toBeGreaterThan(0)
  })
})
