import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders its label and responds to clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Shop Now</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Shop Now' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
