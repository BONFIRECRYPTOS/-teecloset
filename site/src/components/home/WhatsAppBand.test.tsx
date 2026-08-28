import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatsAppBand } from './WhatsAppBand'

describe('WhatsAppBand', () => {
  it('links to the Tee Closet WhatsApp chat', () => {
    render(<WhatsAppBand />)
    expect(screen.getByRole('link', { name: /order on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
