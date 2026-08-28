import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders a status role for loading state', () => {
    render(<Skeleton className="h-4 w-full" />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })
})
