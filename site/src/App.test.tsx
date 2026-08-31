import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { useAuthSession } from '@/lib/auth'
import { App } from './App'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

vi.mock('@/lib/auth', () => ({
  useAuthSession: vi.fn(),
  signIn: vi.fn(),
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('App', () => {
  it('renders the Tee Closet brand name', () => {
    mockCategories()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getAllByText(/tee closet/i).length).toBeGreaterThan(0)
  })
})

describe('App admin routes', () => {
  it('redirects to the admin login page when visiting /admin while signed out', () => {
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({ session: null, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the login form at /admin/login', () => {
    ;(useAuthSession as ReturnType<typeof vi.fn>).mockReturnValue({ session: null, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
