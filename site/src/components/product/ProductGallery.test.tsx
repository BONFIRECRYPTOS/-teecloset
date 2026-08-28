import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGallery } from './ProductGallery'

describe('ProductGallery', () => {
  it('shows the first image and switches on thumbnail click', async () => {
    render(<ProductGallery images={['/a.jpg', '/b.jpg']} alt="Test product" />)
    expect(screen.getByAltText('Test product')).toHaveAttribute('src', '/a.jpg')
    await userEvent.click(screen.getByRole('button', { name: 'Show image 2' }))
    expect(screen.getByAltText('Test product')).toHaveAttribute('src', '/b.jpg')
  })
})
