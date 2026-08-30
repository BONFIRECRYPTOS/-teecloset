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

  it('resets the fallback state when src changes, so a working image renders again', () => {
    const { container, rerender } = render(<ImageWithFallback src="/products/missing.jpg" alt="A product" />)
    const failingImg = screen.getByRole('img', { name: 'A product' })
    fireEvent.error(failingImg)
    expect(screen.getByRole('img', { name: 'A product' })).toHaveTextContent('TC')

    rerender(<ImageWithFallback src="/products/real.jpg" alt="A product" />)

    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', '/products/real.jpg')
  })

  it('renders the branded placeholder when src is missing, without waiting for an error event', () => {
    render(<ImageWithFallback src={undefined} alt="A product with no image" />)
    expect(screen.getByRole('img', { name: 'A product with no image' })).toHaveTextContent('TC')
  })

  it('renders a presentational placeholder (no img role) when alt is empty and the image fails', () => {
    const { container } = render(<ImageWithFallback src="/products/missing.jpg" alt="" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    fireEvent.error(img as HTMLImageElement)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const fallback = container.querySelector('div')
    expect(fallback).toHaveAttribute('aria-hidden', 'true')
    expect(fallback).not.toHaveAttribute('aria-label')
    expect(fallback).toHaveTextContent('TC')
  })
})
