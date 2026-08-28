import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders a title and description', () => {
    render(<EmptyState title="No products found" description="Try adjusting your filters." />)
    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
  })
})
