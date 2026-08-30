import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProducts, useProductBySlug, useProductsBySlugs, useRelatedProducts } from './products'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const ROW = {
  id: '1',
  slug: 'espresso-tailored-blazer',
  name: 'Espresso Tailored Blazer',
  category: 'blazers',
  price_ksh: 3500,
  sizes: [32, 34],
  colors: ['Espresso Black'],
  availability: 'in-stock',
  is_new: true,
  is_featured: true,
  description: 'desc',
  styling_note: 'note',
  product_images: [
    { url: '/b2.jpg', sort_order: 1 },
    { url: '/b1.jpg', sort_order: 0 },
  ],
}

describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('applies category, size, and availability filters and maps rows', async () => {
    const resultPromise = Promise.resolve({ data: [ROW], error: null })
    const chainObj = {
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      then: (onFulfilled: any) => resultPromise.then(onFulfilled),
      catch: (onRejected: any) => resultPromise.catch(onRejected),
    }
    const select = vi.fn().mockReturnValue(chainObj)
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(
      () => useProducts({ category: 'blazers', size: 32, availability: 'in-stock' }),
      { wrapper: QueryWrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data![0].images).toEqual(['/b1.jpg', '/b2.jpg'])
    expect(result.current.data![0].category).toBe('blazers')

    // Verify filter methods were called with correct arguments
    expect(chainObj.eq).toHaveBeenNthCalledWith(1, 'category', 'blazers')
    expect(chainObj.contains).toHaveBeenCalledWith('sizes', [32])
    expect(chainObj.eq).toHaveBeenNthCalledWith(2, 'availability', 'in-stock')
  })
})

describe('useProductBySlug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches a single product by slug', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: ROW, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductBySlug('espresso-tailored-blazer'), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.slug).toBe('espresso-tailored-blazer')

    // Verify eq was called with the correct slug
    expect(eq).toHaveBeenCalledWith('slug', 'espresso-tailored-blazer')
  })

  it('does not query when slug is undefined', () => {
    const select = vi.fn()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    renderHook(() => useProductBySlug(undefined), { wrapper: QueryWrapper })

    expect(select).not.toHaveBeenCalled()
  })
})

describe('useProductsBySlugs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches multiple products by an array of slugs', async () => {
    const inFn = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const select = vi.fn().mockReturnValue({ in: inFn })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductsBySlugs(['espresso-tailored-blazer']), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(inFn).toHaveBeenCalledWith('slug', ['espresso-tailored-blazer'])
  })
})

describe('useRelatedProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('excludes the current product and limits results', async () => {
    const secondRow = { ...ROW, id: '2', slug: 'camel-oversized-blazer' }
    const eq = vi.fn().mockResolvedValue({ data: [ROW, secondRow], error: null })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const currentProduct = { ...ROW, id: '1', priceKsh: 3500 } as never

    const { result } = renderHook(() => useRelatedProducts(currentProduct, 4), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.map((p) => p.id)).toEqual(['2'])
  })
})
