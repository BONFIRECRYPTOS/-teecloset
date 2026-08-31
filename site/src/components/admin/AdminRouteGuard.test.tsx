import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthSession } from '@/lib/auth'
import { AdminRouteGuard } from './AdminRouteGuard'

vi.mock('@/lib/auth', () => ({
  useAuthSession: vi.fn(),
}))

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin/login" element={<div>Login Page</div>} />
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <div>Protected Content</div>
            </AdminRouteGuard>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRouteGuard', () => {
  it('shows a loading state while the session is resolving', () => {
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({ session: null, isLoading: true })
    renderGuard()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects to /admin/login when there is no session', () => {
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({ session: null, isLoading: false })
    renderGuard()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders the protected content when a session exists', () => {
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { id: 'u1' } },
      isLoading: false,
    })
    renderGuard()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
