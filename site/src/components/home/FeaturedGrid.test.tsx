import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeaturedGrid } from './FeaturedGrid'

describe('FeaturedGrid', () => {
  it('renders a Featured Picks heading and product cards', () => {
    render(
      <MemoryRouter>
        <FeaturedGrid />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /featured picks/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
