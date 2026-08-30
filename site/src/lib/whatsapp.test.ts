import { describe, expect, it } from 'vitest'
import { buildWhatsAppOrderLink, buildCartOrderLink } from './whatsapp'
import type { Product } from '@/data/types'

const blazerProduct: Product = {
  id: 'p05',
  slug: 'espresso-tailored-blazer',
  name: 'Espresso Tailored Blazer',
  category: 'blazers',
  priceKsh: 3500,
  sizes: [30, 32, 34, 36, 38],
  colors: ['Espresso Black'],
  availability: 'in-stock',
  isNew: true,
  isFeatured: true,
  description: 'A sharply tailored espresso blazer that instantly elevates any outfit.',
  stylingNote: 'Wear open over a simple tee and jeans, or buttoned for the boardroom.',
  images: ['/products/blazers-1.jpg', '/products/blazers-2.jpg'],
}

const topProduct: Product = {
  id: 'p09',
  slug: 'ivory-wrap-top',
  name: 'Ivory Wrap Top',
  category: 'tops',
  priceKsh: 1200,
  sizes: [26, 28, 30, 32, 34],
  colors: ['Ivory'],
  availability: 'in-stock',
  isNew: true,
  isFeatured: true,
  description: 'A soft ivory wrap top that ties at the waist for an adjustable, flattering fit.',
  stylingNote: 'Tuck into wide-legs or palazzo pants for a polished silhouette.',
  images: ['/products/tops-1.jpg', '/products/tops-2.jpg'],
}

describe('buildWhatsAppOrderLink', () => {
  it('builds a wa.me link with product name, price and page url', () => {
    const product = blazerProduct
    const link = buildWhatsAppOrderLink(product, 'https://teecloset.example/product/espresso-tailored-blazer')

    expect(link).toMatch(/^https:\/\/wa\.me\/254714743575\?text=/)

    const decoded = decodeURIComponent(link.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
    expect(decoded).toContain('KSh 3,500')
    expect(decoded).toContain('https://teecloset.example/product/espresso-tailored-blazer')
    expect(decoded).not.toContain('Size:')
  })

  it('includes the size when provided', () => {
    const product = blazerProduct
    const link = buildWhatsAppOrderLink(
      product,
      'https://teecloset.example/product/espresso-tailored-blazer',
      34,
    )
    const decoded = decodeURIComponent(link.split('text=')[1])
    expect(decoded).toContain('Size: 34')
  })
})

describe('buildCartOrderLink', () => {
  it('builds one message listing every line with size, quantity, price and a total', () => {
    const blazer = blazerProduct
    const top = topProduct
    const link = buildCartOrderLink(
      [
        { product: blazer, size: 34, quantity: 1 },
        { product: top, size: 30, quantity: 2 },
      ],
      'https://teecloset.example/',
    )

    expect(link).toMatch(/^https:\/\/wa\.me\/254714743575\?text=/)

    const decoded = decodeURIComponent(link.split('text=')[1])
    expect(decoded).toContain('1. Espresso Tailored Blazer (Size 34) x1 - KSh 3,500')
    expect(decoded).toContain('2. Ivory Wrap Top (Size 30) x2 - KSh 2,400')
    expect(decoded).toContain('Total: KSh 5,900')
    expect(decoded).toContain('https://teecloset.example/')
  })
})
