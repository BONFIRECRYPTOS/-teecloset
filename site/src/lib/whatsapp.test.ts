import { describe, expect, it } from 'vitest'
import { buildWhatsAppOrderLink, buildCartOrderLink } from './whatsapp'
import { getProductBySlug } from '@/data/products'

describe('buildWhatsAppOrderLink', () => {
  it('builds a wa.me link with product name, price and page url', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    const link = buildWhatsAppOrderLink(product, 'https://teecloset.example/product/espresso-tailored-blazer')

    expect(link).toMatch(/^https:\/\/wa\.me\/254714743575\?text=/)

    const decoded = decodeURIComponent(link.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
    expect(decoded).toContain('KSh 3,500')
    expect(decoded).toContain('https://teecloset.example/product/espresso-tailored-blazer')
    expect(decoded).not.toContain('Size:')
  })

  it('includes the size when provided', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
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
    const blazer = getProductBySlug('espresso-tailored-blazer')!
    const top = getProductBySlug('ivory-wrap-top')!
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
