import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPanel } from './FilterPanel'

describe('FilterPanel', () => {
  it('calls onChange with the selected category', async () => {
    const onChange = vi.fn()
    render(<FilterPanel filters={{}} onChange={onChange} isOpen onClose={() => {}} />)
    await userEvent.click(screen.getByLabelText('Blazers'))
    expect(onChange).toHaveBeenCalledWith({ category: 'blazers' })
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<FilterPanel filters={{}} onChange={() => {}} isOpen onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close filters/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
