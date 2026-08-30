import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { Home } from './Home'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('Home', () => {
  it('renders the hero and the Visit Our Store section', () => {
    mockCategories()
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/confidence/i)
    expect(screen.getByRole('heading', { name: /visit our store/i })).toBeInTheDocument()
  })
})
