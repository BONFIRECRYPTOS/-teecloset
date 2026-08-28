import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhyTeeCloset } from './WhyTeeCloset'

describe('WhyTeeCloset', () => {
  it('renders the heading and all four reasons', () => {
    render(<WhyTeeCloset />)
    expect(screen.getByRole('heading', { name: /why tee closet/i })).toBeInTheDocument()
    expect(screen.getByText('Shop on WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Limited Drops')).toBeInTheDocument()
  })
})
