import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AvailabilityBadge } from './AvailabilityBadge'

describe('AvailabilityBadge', () => {
  it.each([
    ['in-stock', 'In Stock'],
    ['limited', 'Limited Stock'],
    ['sold', 'Sold Out'],
  ] as const)('renders %s as "%s"', (availability, label) => {
    render(<AvailabilityBadge availability={availability} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
