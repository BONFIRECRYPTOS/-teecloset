import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { signIn, useAuthSession } from '@/lib/auth'
import { AdminLogin } from './AdminLogin'

vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
  useAuthSession: vi.fn(),
}))

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({ session: null, isLoading: false })
  })

  it('submits email and password to signIn', async () => {
    ;(signIn as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'owner@teecloset.co.ke')
    await userEvent.type(screen.getByLabelText(/password/i), 'correct-password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signIn).toHaveBeenCalledWith('owner@teecloset.co.ke', 'correct-password')
  })

  it('shows an error message when signIn fails', async () => {
    ;(signIn as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Invalid login credentials'))
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'owner@teecloset.co.ke')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect email or password/i)
  })

  it('redirects away from the login page when already signed in', () => {
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { id: 'u1' } },
      isLoading: false,
    })
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })
})
