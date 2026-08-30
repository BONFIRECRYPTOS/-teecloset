import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { useCategories, getCategoryLabel } from './categories'

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
