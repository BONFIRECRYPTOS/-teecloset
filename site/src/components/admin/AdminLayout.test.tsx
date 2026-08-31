import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { signOut } from '@/lib/auth'
import { AdminLayout } from './AdminLayout'

vi.mock('@/lib/auth', () => ({
  signOut: vi.fn(),
}))

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminLayout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the nested route content via Outlet', () => {
    renderLayout()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })

  it('renders navigation links to the dashboard and add-product page', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: /add product/i })).toHaveAttribute('href', '/admin/products/new')
  })

  it('calls signOut when the sign-out button is clicked', async () => {
    renderLayout()
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(signOut).toHaveBeenCalled()
  })
})
