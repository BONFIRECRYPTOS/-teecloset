import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { NewStockStrip } from './NewStockStrip'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const testProducts = [
  {
    id: 'p1',
    slug: 'test-new-blazer',
    name: 'Test New Blazer',
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
      return { select: vi.fn().mockResolvedValue({ data: testProducts, error: null }) }
    }
    const order = vi.fn().mockResolvedValue({ data: [], error: null })
    const select = vi.fn().mockReturnValue({ order })
    return { select }
  })
}

describe('NewStockStrip', () => {
  it('renders a New Stock heading and at least one product', async () => {
    mockSupabase()
    render(
      <MemoryRouter>
        <NewStockStrip />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(await screen.findByRole('heading', { name: /new stock/i })).toBeInTheDocument()
    expect((await screen.findAllByRole('link')).length).toBeGreaterThan(0)
  })
})
