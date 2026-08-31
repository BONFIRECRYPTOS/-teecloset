import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminProductForm } from './AdminProductForm'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}))

function mockCategoriesAndEmptyImages() {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'categories') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }],
            error: null,
          }),
        }),
      }
    }
    if (table === 'product_images') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }
    }
    return { select: vi.fn() }
  })
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
        <Route path="/admin" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: QueryWrapper },
  )
}

describe('AdminProductForm — create mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a product, then shows the image manager and a Done link instead of navigating away', async () => {
    mockCategoriesAndEmptyImages()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }],
              error: null,
            }),
          }),
        }
      }
      if (table === 'products') {
        return {
          select: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'p1', slug: 'test-blazer' }, error: null }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }
    })

    renderAt('/admin/products/new')

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Test Blazer')
    await userEvent.selectOptions(await screen.findByLabelText(/category/i), 'blazers')
    await userEvent.type(screen.getByLabelText(/price/i), '3000')
    await userEvent.click(screen.getByLabelText('32'))
    await userEvent.click(screen.getByRole('button', { name: /create product/i }))

    expect(await screen.findByText(/done — back to dashboard/i)).toBeInTheDocument()
    expect(screen.queryByText(/save the product first/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByText(/done — back to dashboard/i))
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  })
})

describe('AdminProductForm — edit mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and pre-fills an existing product, then navigates to the dashboard after saving', async () => {
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }],
              error: null,
            }),
          }),
        }
      }
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'p1',
                  slug: 'espresso-tailored-blazer',
                  name: 'Espresso Tailored Blazer',
                  category: 'blazers',
                  price_ksh: 3500,
                  sizes: [32, 34],
                  colors: ['Espresso Black'],
                  availability: 'in-stock',
                  is_new: true,
                  is_featured: true,
                  description: 'desc',
                  styling_note: 'note',
                  product_images: [],
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }
    })

    renderAt('/admin/products/p1/edit')

    expect(await screen.findByLabelText(/^name$/i)).toHaveValue('Espresso Tailored Blazer')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  })

  it('shows a not-found message when the product id does not exist', async () => {
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
      }
      if (table === 'products') {
        return {
          select: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
        }
      }
      return { select: vi.fn() }
    })

    renderAt('/admin/products/missing/edit')

    expect(await screen.findByText(/product not found/i)).toBeInTheDocument()
  })
})
