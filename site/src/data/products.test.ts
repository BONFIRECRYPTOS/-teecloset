import { describe, expect, it } from 'vitest'
import { getProducts, getProductBySlug, getRelatedProducts } from './products'

describe('getProducts', () => {
  it('returns all 20 seed products with no filters', () => {
    expect(getProducts()).toHaveLength(20)
  })

  it('filters by category', () => {
    const results = getProducts({ category: 'blazers' })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((p) => p.category === 'blazers')).toBe(true)
  })

  it('filters by size', () => {
    const results = getProducts({ size: 40 })
    expect(results.every((p) => p.sizes.includes(40))).toBe(true)
  })

  it('filters by availability', () => {
    const results = getProducts({ availability: 'sold' })
    expect(results.every((p) => p.availability === 'sold')).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('sorts by price ascending', () => {
    const results = getProducts({ sort: 'price-asc' })
    for (let i = 1; i < results.length; i++) {
      expect(results[i].priceKsh).toBeGreaterThanOrEqual(results[i - 1].priceKsh)
    }
  })

  it('does not hard-code a single universal price', () => {
    const prices = new Set(getProducts().map((p) => p.priceKsh))
    expect(prices.size).toBeGreaterThan(1)
  })
})

describe('getProductBySlug', () => {
  it('finds a known product', () => {
    expect(getProductBySlug('espresso-tailored-blazer')?.name).toBe('Espresso Tailored Blazer')
  })

  it('returns undefined for an unknown slug', () => {
    expect(getProductBySlug('does-not-exist')).toBeUndefined()
  })
})

describe('getRelatedProducts', () => {
  it('returns same-category products excluding itself', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    const related = getRelatedProducts(product)
    expect(related.every((p) => p.category === 'blazers' && p.id !== product.id)).toBe(true)
  })
})
