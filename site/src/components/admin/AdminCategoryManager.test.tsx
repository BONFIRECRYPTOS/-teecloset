import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminCategoryManager } from './AdminCategoryManager'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const CATEGORY_ROW = { id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }

function mockSupabase(overrides?: {
  onInsert?: () => { error: Error | null }
  onUpdate?: () => { error: Error | null }
  onDeleteCount?: number
}) {
  const insertSpy = vi.fn().mockResolvedValue(overrides?.onInsert?.() ?? { error: null })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'categories') {
      return {
        select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [CATEGORY_ROW], error: null }) }),
        insert: insertSpy,
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue(overrides?.onUpdate?.() ?? { error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }
    }
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ count: overrides?.onDeleteCount ?? 0, error: null }) }),
    }
  })
  return { insertSpy }
}

function renderManager() {
  return render(<AdminCategoryManager />, { wrapper: QueryWrapper })
}

describe('AdminCategoryManager', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists existing categories', async () => {
    mockSupabase()
    renderManager()
    expect(await screen.findByText('Blazers')).toBeInTheDocument()
  })

  it('adds a new category', async () => {
    const { insertSpy } = mockSupabase()
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.type(screen.getByLabelText(/new category name/i), 'Jackets')
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }))

    await waitFor(() => {
      expect(insertSpy).toHaveBeenCalledWith({ slug: 'jackets', label: 'Jackets', sort_order: 1 })
    })
  })

  it('shows an inline error when adding a category fails', async () => {
    mockSupabase({ onInsert: () => ({ error: new Error('duplicate key value violates unique constraint') }) })
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.type(screen.getByLabelText(/new category name/i), 'Jackets')
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /duplicate key value violates unique constraint/i,
    )
  })

  it('renames a category', async () => {
    mockSupabase()
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.click(screen.getByRole('button', { name: /rename/i }))
    const input = screen.getByLabelText(/rename Blazers/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Outerwear')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.queryByLabelText(/rename Blazers/i)).not.toBeInTheDocument()
  })

  it('shows a friendly error when deleting a category still in use', async () => {
    mockSupabase({ onDeleteCount: 2 })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/2 products still use this category/i)
  })
})
