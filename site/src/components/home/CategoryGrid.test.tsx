import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryGrid } from './CategoryGrid'

describe('CategoryGrid', () => {
  it('links every category to its filtered shop URL', () => {
    render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /blazers/i })).toHaveAttribute('href', '/shop?category=blazers')
    expect(screen.getByRole('link', { name: /palazzo pants/i })).toHaveAttribute('href', '/shop?category=palazzo')
  })
})
