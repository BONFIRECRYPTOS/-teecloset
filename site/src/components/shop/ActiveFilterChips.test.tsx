import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveFilterChips } from './ActiveFilterChips'

describe('ActiveFilterChips', () => {
  it('renders a chip for each active filter and removes it on click', async () => {
    const onRemove = vi.fn()
    render(<ActiveFilterChips filters={{ category: 'blazers', size: 32 }} onRemove={onRemove} />)
    expect(screen.getByText(/blazers/i)).toBeInTheDocument()
    await userEvent.click(screen.getByText(/size 32/i))
    expect(onRemove).toHaveBeenCalledWith('size')
  })

  it('renders nothing when there are no active filters', () => {
    const { container } = render(<ActiveFilterChips filters={{}} onRemove={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
