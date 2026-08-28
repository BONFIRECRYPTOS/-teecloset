import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialProof } from './SocialProof'

describe('SocialProof', () => {
  it('links to the exact Tee Closet TikTok URL', () => {
    render(<SocialProof />)
    expect(screen.getByRole('link', { name: /follow on tiktok/i })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW',
    )
  })
})
