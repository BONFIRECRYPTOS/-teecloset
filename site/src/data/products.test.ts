import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import {
  useProducts,
  useProductBySlug,
  useProductsBySlugs,
  useRelatedProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductById,
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useReorderProductImages,
} from './products'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper, createTestQueryClient } from '@/test/queryWrapper'
import type { Size } from './types'

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

  it('sorts results client-side via select without changing the query for different sort values', async () => {
    const rows = [
      { ...ROW, id: '1', price_ksh: 1000, is_new: false, is_featured: false },
      { ...ROW, id: '2', price_ksh: 3000, is_new: true, is_featured: true },
    ]
    const resultPromise = Promise.resolve({ data: rows, error: null })
    const chainObj = {
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      then: (onFulfilled: any) => resultPromise.then(onFulfilled),
      catch: (onRejected: any) => resultPromise.catch(onRejected),
    }
    const select = vi.fn().mockReturnValue(chainObj)
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result, rerender } = renderHook(
      ({ sort }: { sort: 'newest' | 'price-asc' }) => useProducts({ sort }),
      { wrapper, initialProps: { sort: 'newest' } },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // 'newest' sorts is_new products first.
    expect(result.current.data!.map((p) => p.id)).toEqual(['2', '1'])
    expect(supabase.from).toHaveBeenCalledTimes(1)

    // Changing only the sort should re-order the already-fetched data, not trigger a new fetch.
    rerender({ sort: 'price-asc' })
    await waitFor(() => expect(result.current.data!.map((p) => p.id)).toEqual(['1', '2']))
    expect(supabase.from).toHaveBeenCalledTimes(1)
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

const PRODUCT_INPUT = {
  name: 'Camel Wide-Leg Trousers',
  category: 'wide-leg',
  priceKsh: 2800,
  sizes: [28, 30, 32] as Size[],
  colors: ['Camel'],
  availability: 'in-stock' as const,
  isNew: true,
  isFeatured: false,
  description: 'desc',
  stylingNote: 'note',
}

describe('useCreateProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('generates a unique slug and inserts the product', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqSlug = vi.fn().mockReturnValue({ maybeSingle })
    const selectSlug = vi.fn().mockReturnValue({ eq: eqSlug })
    const single = vi.fn().mockResolvedValue({ data: { id: 'p1', slug: 'camel-wide-leg-trousers' }, error: null })
    const selectInsert = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select: selectInsert })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectSlug, insert })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      const created = await result.current.mutateAsync(PRODUCT_INPUT)
      expect(created.slug).toBe('camel-wide-leg-trousers')
    })

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'camel-wide-leg-trousers', name: PRODUCT_INPUT.name }))
  })

  it('appends a numeric suffix when the base slug is taken', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: 'existing' }, error: null })
      .mockResolvedValueOnce({ data: null, error: null })
    const eqSlug = vi.fn().mockReturnValue({ maybeSingle })
    const selectSlug = vi.fn().mockReturnValue({ eq: eqSlug })
    const single = vi.fn().mockResolvedValue({ data: { id: 'p1', slug: 'camel-wide-leg-trousers-2' }, error: null })
    const selectInsert = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select: selectInsert })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectSlug, insert })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync(PRODUCT_INPUT)
    })

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'camel-wide-leg-trousers-2' }))
  })
})

describe('useUpdateProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates a product without changing its slug', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'p1', ...PRODUCT_INPUT })
    })

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ name: PRODUCT_INPUT.name }))
    expect(update.mock.calls[0][0]).not.toHaveProperty('slug')
    expect(eq).toHaveBeenCalledWith('id', 'p1')
  })

  it('invalidates the product-by-id cache entry for the updated id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useUpdateProduct(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'p1', ...PRODUCT_INPUT })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['product'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['product-by-id', 'p1'] })
  })
})

describe('useDeleteProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a product by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ delete: del })

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync('p1')
    })

    expect(eq).toHaveBeenCalledWith('id', 'p1')
  })
})

describe('useProductById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches a single product by database id', async () => {
    const ROW = {
      id: 'p1',
      slug: 'camel-wide-leg-trousers',
      name: 'Camel Wide-Leg Trousers',
      category: 'wide-leg',
      price_ksh: 2800,
      sizes: [28, 30],
      colors: ['Camel'],
      availability: 'in-stock',
      is_new: true,
      is_featured: false,
      description: 'desc',
      styling_note: 'note',
      product_images: [],
    }
    const maybeSingle = vi.fn().mockResolvedValue({ data: ROW, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductById('p1'), { wrapper: QueryWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('p1')
    expect(eq).toHaveBeenCalledWith('id', 'p1')
  })

  it('does not query when id is undefined', () => {
    const select = vi.fn()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    renderHook(() => useProductById(undefined), { wrapper: QueryWrapper })

    expect(select).not.toHaveBeenCalled()
  })
})

describe('useProductImages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches images ordered by sort_order', async () => {
    const order = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'img1', url: '/a.jpg', sort_order: 0 }], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductImages('p1'), { wrapper: QueryWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 'img1', url: '/a.jpg', sortOrder: 0 }])
  })
})

describe('useUploadProductImage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uploads a file to storage and inserts a product_images row', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/products/p1/x.jpg' } })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.storage as unknown as { from: ReturnType<typeof vi.fn> }) = {
      from: vi.fn().mockReturnValue({ upload, getPublicUrl }),
    } as never
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useUploadProductImage(), { wrapper: QueryWrapper })
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await result.current.mutateAsync({ productId: 'p1', file, sortOrder: 0 })
    })

    expect(upload).toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: 'p1', url: 'https://cdn/products/p1/x.jpg', sort_order: 0 }),
    )
  })
})

describe('useDeleteProductImage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes an image row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ delete: del })

    const { result } = renderHook(() => useDeleteProductImage(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ imageId: 'img1', productId: 'p1' })
    })

    expect(eq).toHaveBeenCalledWith('id', 'img1')
  })
})

describe('useReorderProductImages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates sort_order for each image in the new order', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const { result } = renderHook(() => useReorderProductImages(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ productId: 'p1', orderedIds: ['img2', 'img1'] })
    })

    expect(update).toHaveBeenNthCalledWith(1, { sort_order: 0 })
    expect(eq).toHaveBeenNthCalledWith(1, 'id', 'img2')
    expect(update).toHaveBeenNthCalledWith(2, { sort_order: 1 })
    expect(eq).toHaveBeenNthCalledWith(2, 'id', 'img1')
  })
})
