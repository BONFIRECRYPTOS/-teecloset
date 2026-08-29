import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageWithFallback } from './ImageWithFallback'

describe('ImageWithFallback', () => {
  it('renders the image by default', () => {
    render(<ImageWithFallback src="/products/real.jpg" alt="A real product" />)
    expect(screen.getByRole('img', { name: 'A real product' })).toHaveAttribute('src', '/products/real.jpg')
  })

  it('renders a branded placeholder when the image fails to load', () => {
    render(<ImageWithFallback src="/products/missing.jpg" alt="A missing product" />)
    const img = screen.getByRole('img', { name: 'A missing product' })
    fireEvent.error(img)
    expect(screen.getByRole('img', { name: 'A missing product' })).toHaveTextContent('TC')
  })
})
