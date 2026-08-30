import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getProductBySlug } from '@/data/products'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductCard } from './ProductCard'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories(data: { id: string; slug: string; label: string; sort_order: number }[]) {
  const order = vi.fn().mockResolvedValue({ data, error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('ProductCard', () => {
  it('links to the product detail page and shows name, price and availability', async () => {
    mockCategories([{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }])
    const product = getProductBySlug('espresso-tailored-blazer')!
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByRole('link', { name: 'Espresso Tailored Blazer' })).toHaveAttribute(
      'href',
      '/product/espresso-tailored-blazer',
    )
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(await screen.findByText('Blazers')).toBeInTheDocument()
  })

  it('includes a WhatsApp quick-order link with product name and price', async () => {
    mockCategories([{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }])
    const product = getProductBySlug('espresso-tailored-blazer')!
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    const link = screen.getByRole('link', { name: /order espresso tailored blazer on whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/254714743575'))
    const decoded = decodeURIComponent(link.getAttribute('href')!.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
    expect(decoded).toContain('KSh 3,500')
  })
})
