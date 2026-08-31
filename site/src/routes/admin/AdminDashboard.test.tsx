import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminDashboard } from './AdminDashboard'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'products') {
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })
  })

  it('renders both the product list and category manager sections', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )

    expect(await screen.findByRole('heading', { name: /^products$/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /^categories$/i })).toBeInTheDocument()
  })
})
