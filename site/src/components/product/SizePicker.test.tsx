import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SizePicker } from './SizePicker'

describe('SizePicker', () => {
  it('calls onSelect with the chosen size', async () => {
    const onSelect = vi.fn()
    render(<SizePicker sizes={[30, 32, 34]} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '32' }))
    expect(onSelect).toHaveBeenCalledWith(32)
  })

  it('marks the selected size as pressed', () => {
    render(<SizePicker sizes={[30, 32, 34]} selected={34} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: '34' })).toHaveAttribute('aria-pressed', 'true')
  })
})
