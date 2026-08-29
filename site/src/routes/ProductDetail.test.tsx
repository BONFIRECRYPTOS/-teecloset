import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProductDetail } from './ProductDetail'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:slug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProductDetail', () => {
  it('renders product name, price, styling note and a WhatsApp order link', () => {
    renderAt('/product/espresso-tailored-blazer')
    expect(screen.getByRole('heading', { name: 'Espresso Tailored Blazer' })).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText(/wear open over a simple tee/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /order on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714743575'),
    )
  })

  it('disables ordering for a sold-out product', () => {
    renderAt('/product/cream-linen-blazer')
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled()
  })

  it('renders related products from the same category', () => {
    renderAt('/product/espresso-tailored-blazer')
    expect(screen.getByRole('heading', { name: /you might also like/i })).toBeInTheDocument()
  })

  it('renders NotFound content for an unknown slug', () => {
    renderAt('/product/does-not-exist')
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })
})
