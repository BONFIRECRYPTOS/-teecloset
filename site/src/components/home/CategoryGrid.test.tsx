import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { CategoryGrid } from './CategoryGrid'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({
    data: [
      { id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 },
      { id: '2', slug: 'palazzo', label: 'Palazzo Pants', sort_order: 2 },
    ],
    error: null,
  })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('CategoryGrid', () => {
  it('links every category to its filtered shop URL', async () => {
    mockCategories()
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
})
