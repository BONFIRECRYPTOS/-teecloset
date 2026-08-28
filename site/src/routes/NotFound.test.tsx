import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFound } from './NotFound'

describe('NotFound', () => {
  it('renders a branded 404 message with a link home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )
    expect(screen.getByText(/404/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to shopping/i })).toHaveAttribute('href', '/')
  })
})
