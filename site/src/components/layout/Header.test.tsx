import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'

describe('Header', () => {
  it('renders the Tee Closet logo, primary nav links and a WhatsApp CTA', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.getByAltText(/tee closet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop')
    expect(screen.getByRole('link', { name: /chat on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
