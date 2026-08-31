import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { useCategories, getCategoryLabel, useCreateCategory, useUpdateCategory, useDeleteCategory } from './categories'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

describe('useCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches and maps categories ordered by sort_order', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }],
      error: null,
    })
    const select = vi.fn().mockReturnValue({ order })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useCategories(), { wrapper: QueryWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: '1', slug: 'blazers', label: 'Blazers', sortOrder: 1 }])
    expect(supabase.from).toHaveBeenCalledWith('categories')
  })
})

describe('getCategoryLabel', () => {
  it('returns the matching label', () => {
    const categories = [{ id: '1', slug: 'blazers', label: 'Blazers', sortOrder: 1 }]
    expect(getCategoryLabel(categories, 'blazers')).toBe('Blazers')
  })

  it('falls back to the slug when not found', () => {
    expect(getCategoryLabel([], 'unknown')).toBe('unknown')
  })
})

describe('useCreateCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserts a category and invalidates the categories query', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useCreateCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ slug: 'jackets', label: 'Jackets', sortOrder: 6 })
    })

    expect(insert).toHaveBeenCalledWith({ slug: 'jackets', label: 'Jackets', sort_order: 6 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('surfaces an insert error', async () => {
    const insert = vi.fn().mockResolvedValue({ error: new Error('duplicate key value') })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useCreateCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ slug: 'blazers', label: 'Blazers', sortOrder: 1 }),
      ).rejects.toThrow('duplicate key value')
    })
  })
})

describe('useUpdateCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates a category label', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const { result } = renderHook(() => useUpdateCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'cat-1', label: 'Outerwear' })
    })

    expect(update).toHaveBeenCalledWith({ label: 'Outerwear' })
    expect(eq).toHaveBeenCalledWith('id', 'cat-1')
  })
})

describe('useDeleteCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a category with no referencing products', async () => {
    const productsEq = vi.fn().mockResolvedValue({ count: 0, error: null })
    const productsSelect = vi.fn().mockReturnValue({ eq: productsEq })
    const categoriesEq = vi.fn().mockResolvedValue({ error: null })
    const categoriesDelete = vi.fn().mockReturnValue({ eq: categoriesEq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) =>
      table === 'products' ? { select: productsSelect } : { delete: categoriesDelete },
    )

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'cat-1', slug: 'jackets' })
    })

    expect(categoriesDelete).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('blocks deletion with a friendly error when products still reference the category', async () => {
    const productsEq = vi.fn().mockResolvedValue({ count: 3, error: null })
    const productsSelect = vi.fn().mockReturnValue({ eq: productsEq })
    const categoriesDelete = vi.fn()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) =>
      table === 'products' ? { select: productsSelect } : { delete: categoriesDelete },
    )

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 'cat-1', slug: 'blazers' })).rejects.toThrow(
        /3 products still use this category/,
      )
    })

    expect(categoriesDelete).not.toHaveBeenCalled()
  })
})
