import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ActiveFilterChips } from './ActiveFilterChips'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({
    data: [{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }],
    error: null,
  })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('ActiveFilterChips', () => {
  it('renders a chip for each active filter and removes it on click', async () => {
    mockCategories()
    const onRemove = vi.fn()
    render(<ActiveFilterChips filters={{ category: 'blazers', size: 32 }} onRemove={onRemove} />, {
      wrapper: QueryWrapper,
    })
    expect(await screen.findByText(/blazers/i)).toBeInTheDocument()
    await userEvent.click(screen.getByText(/size 32/i))
    expect(onRemove).toHaveBeenCalledWith('size')
  })

  it('renders nothing when there are no active filters', () => {
    mockCategories()
    const { container } = render(<ActiveFilterChips filters={{}} onRemove={() => {}} />, {
      wrapper: QueryWrapper,
    })
    expect(container).toBeEmptyDOMElement()
  })
})
