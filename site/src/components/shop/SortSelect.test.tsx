import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortSelect } from './SortSelect'

describe('SortSelect', () => {
  it('calls onChange with the newly selected sort option', async () => {
    const onChange = vi.fn()
    render(<SortSelect value="newest" onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc')
    expect(onChange).toHaveBeenCalledWith('price-asc')
  })
})
