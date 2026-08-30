import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { Shop } from './Shop'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({
    data: [{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }],
    error: null,
  })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('Shop', () => {
  it('filters products by the category in the URL', () => {
    mockCategories()
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers']}>
        <Shop />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.queryByText('Camel Wide-Leg Trousers')).not.toBeInTheDocument()
  })

  it('shows an empty state when no products match the filters', () => {
    mockCategories()
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers&size=26']}>
        <Shop />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByText(/no pieces match those filters/i)).toBeInTheDocument()
  })
})
