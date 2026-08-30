import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { FeaturedGrid } from './FeaturedGrid'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('FeaturedGrid', () => {
  it('renders a Featured Picks heading and product cards', () => {
    mockCategories()
    render(
      <MemoryRouter>
        <FeaturedGrid />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByRole('heading', { name: /featured picks/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
