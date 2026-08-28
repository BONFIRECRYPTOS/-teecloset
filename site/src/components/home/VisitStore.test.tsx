import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisitStore } from './VisitStore'

describe('VisitStore', () => {
  it('renders the heading, coordinates and a Get Directions link to the exact Maps URL', () => {
    render(<VisitStore />)
    expect(screen.getByRole('heading', { name: /visit our store/i })).toBeInTheDocument()
    expect(screen.getByText(/-0.426654/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get directions/i })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac',
    )
  })
})
