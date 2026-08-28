import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Shop } from './Shop'

describe('Shop', () => {
  it('filters products by the category in the URL', () => {
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers']}>
        <Shop />
      </MemoryRouter>,
    )
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.queryByText('Camel Wide-Leg Trousers')).not.toBeInTheDocument()
  })

  it('shows an empty state when no products match the filters', () => {
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers&size=26']}>
        <Shop />
      </MemoryRouter>,
    )
    expect(screen.getByText(/no pieces match those filters/i)).toBeInTheDocument()
  })
})
