import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { App } from './App'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('App', () => {
  it('renders the Tee Closet brand name', () => {
    mockCategories()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getAllByText(/tee closet/i).length).toBeGreaterThan(0)
  })
})
