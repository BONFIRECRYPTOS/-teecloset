import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NewStockStrip } from './NewStockStrip'

describe('NewStockStrip', () => {
  it('renders a New Stock heading and at least one product', () => {
    render(
      <MemoryRouter>
        <NewStockStrip />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /new stock/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
