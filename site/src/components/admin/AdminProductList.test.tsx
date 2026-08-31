import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminProductList } from './AdminProductList'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const PRODUCT_ROW = {
  id: 'p1',
  slug: 'camel-wide-leg-trousers',
  name: 'Camel Wide-Leg Trousers',
  category: 'wide-leg',
  price_ksh: 2800,
  sizes: [28, 30],
  colors: ['Camel'],
  availability: 'in-stock',
  is_new: true,
  is_featured: false,
  description: 'desc',
  styling_note: 'note',
  product_images: [],
}

function mockSupabase(products: unknown[] = [PRODUCT_ROW]) {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'products') {
      return { select: vi.fn().mockResolvedValue({ data: products, error: null }) }
    }
    return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
  })
}

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AdminProductList />
    </MemoryRouter>,
    { wrapper: QueryWrapper },
  )
}

describe('AdminProductList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists products with an edit link and a delete button', async () => {
    mockSupabase()
    renderWithProviders()

    expect(await screen.findByText('Camel Wide-Leg Trousers')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/admin/products/p1/edit')
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows an empty state when there are no products', async () => {
    mockSupabase([])
    renderWithProviders()
    expect(await screen.findByText(/no products yet/i)).toBeInTheDocument()
  })

  it('deletes a product after confirming, and shows an error if the delete fails', async () => {
    mockSupabase()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockResolvedValue({ data: [PRODUCT_ROW], error: null }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: new Error('network error') }) }),
        }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })
    renderWithProviders()

    await screen.findByText('Camel Wide-Leg Trousers')
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
  })
})
