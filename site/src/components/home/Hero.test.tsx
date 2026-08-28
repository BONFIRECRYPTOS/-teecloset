import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders the headline and a Shop link', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/confidence/i)
    expect(screen.getByRole('link', { name: /shop new stock/i })).toHaveAttribute('href', '/shop')
  })
})
