import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getProductBySlug } from '@/data/products'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('links to the product detail page and shows name, price and availability', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Espresso Tailored Blazer' })).toHaveAttribute(
      'href',
      '/product/espresso-tailored-blazer',
    )
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('includes a WhatsApp quick-order link with product name and price', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /order espresso tailored blazer on whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/254714743575'))
    const decoded = decodeURIComponent(link.getAttribute('href')!.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
    expect(decoded).toContain('KSh 3,500')
  })
})
