import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatsAppFloatingCTA } from './WhatsAppFloatingCTA'

describe('WhatsAppFloatingCTA', () => {
  it('links to the Tee Closet WhatsApp chat', () => {
    render(<WhatsAppFloatingCTA />)
    expect(screen.getByRole('link', { name: /chat with tee closet on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714743575'),
    )
  })
})
