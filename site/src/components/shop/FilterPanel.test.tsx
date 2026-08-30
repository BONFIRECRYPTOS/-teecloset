import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { FilterPanel } from './FilterPanel'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({
    data: [
      { id: '1', slug: 'wide-leg', label: 'Wide-Leg Pants', sort_order: 1 },
      { id: '2', slug: 'blazers', label: 'Blazers', sort_order: 2 },
      { id: '3', slug: 'tops', label: 'Tops', sort_order: 3 },
    ],
    error: null,
  })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('FilterPanel', () => {
  it('calls onChange with the selected category', async () => {
    mockCategories()
    const onChange = vi.fn()
    render(<FilterPanel filters={{}} onChange={onChange} isOpen onClose={() => {}} />, {
      wrapper: QueryWrapper,
    })
    await userEvent.click(await screen.findByLabelText('Blazers'))
    expect(onChange).toHaveBeenCalledWith({ category: 'blazers' })
  })

  it('calls onClose when the close button is clicked', async () => {
    mockCategories()
    const onClose = vi.fn()
    render(<FilterPanel filters={{}} onChange={() => {}} isOpen onClose={onClose} />, {
      wrapper: QueryWrapper,
    })
    await userEvent.click(screen.getByRole('button', { name: /close filters/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
