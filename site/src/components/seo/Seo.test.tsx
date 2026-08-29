import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Seo } from './Seo'

describe('Seo', () => {
  it('sets the document title and description meta tag', () => {
    render(<Seo title="Shop" description="Shop Tee Closet pieces." />)
    expect(document.title).toBe('Shop | Tee Closet')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Shop Tee Closet pieces.',
    )
  })

  it('injects JSON-LD structured data when provided', () => {
    render(<Seo title="Blazer" description="A blazer." structuredData={{ '@type': 'Product' }} />)
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.textContent).toContain('"@type":"Product"')
  })

  it('sets og:image when an image is provided', () => {
    render(<Seo title="Blazer" description="A blazer." image="/products/blazer.jpg" />)
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      '/products/blazer.jpg',
    )
  })

  it('clears a stale og:image left by a previous page when no image is provided', () => {
    const { rerender } = render(<Seo title="Blazer" description="A blazer." image="/products/blazer.jpg" />)
    expect(document.querySelector('meta[property="og:image"]')).not.toBeNull()

    rerender(<Seo title="Shop" description="Shop Tee Closet pieces." />)
    expect(document.querySelector('meta[property="og:image"]')).toBeNull()
  })
})
