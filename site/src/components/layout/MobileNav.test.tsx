import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MobileNav } from './MobileNav'

describe('MobileNav', () => {
  it('renders Home, Shop and WhatsApp tabs', () => {
    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop')
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
