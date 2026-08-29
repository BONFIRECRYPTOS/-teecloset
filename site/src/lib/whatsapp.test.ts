import { describe, expect, it } from 'vitest'
import { buildWhatsAppOrderLink } from './whatsapp'
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
