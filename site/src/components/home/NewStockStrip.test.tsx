import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { NewStockStrip } from './NewStockStrip'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('NewStockStrip', () => {
  it('renders a New Stock heading and at least one product', () => {
    mockCategories()
    render(
      <MemoryRouter>
        <NewStockStrip />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByRole('heading', { name: /new stock/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
