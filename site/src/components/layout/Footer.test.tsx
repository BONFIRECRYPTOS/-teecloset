import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the brand tagline and a TikTok link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )
    expect(screen.getByText(/style\. confidence\. you\./i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW',
    )
  })
})
