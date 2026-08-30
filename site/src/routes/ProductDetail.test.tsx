import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductDetail } from './ProductDetail'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories(data: { id: string; slug: string; label: string; sort_order: number }[]) {
  const order = vi.fn().mockResolvedValue({ data, error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:slug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: QueryWrapper },
  )
}

describe('ProductDetail', () => {
  it('renders product name, price, styling note and a WhatsApp order link', async () => {
    mockCategories([{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }])
    renderAt('/product/espresso-tailored-blazer')
    expect(screen.getByRole('heading', { name: 'Espresso Tailored Blazer' })).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText(/wear open over a simple tee/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /order on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714743575'),
    )
    expect((await screen.findAllByText('Blazers')).length).toBeGreaterThan(0)
  })

  it('disables ordering for a sold-out product', async () => {
    mockCategories([])
    renderAt('/product/cream-linen-blazer')
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled()
  })

  it('renders related products from the same category', async () => {
    mockCategories([])
    renderAt('/product/espresso-tailored-blazer')
    expect(screen.getByRole('heading', { name: /you might also like/i })).toBeInTheDocument()
  })

  it('renders NotFound content for an unknown slug', async () => {
    mockCategories([])
    renderAt('/product/does-not-exist')
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })
})
