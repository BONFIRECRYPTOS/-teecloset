import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from './supabaseClient'
import { signIn, signOut, useAuthSession } from './auth'

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

describe('signIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signs in with email and password', async () => {
    ;(supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null })
    await signIn('owner@teecloset.co.ke', 'correct-password')
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'owner@teecloset.co.ke',
      password: 'correct-password',
    })
  })

  it('throws on invalid credentials', async () => {
    ;(supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: new Error('Invalid login credentials'),
    })
    await expect(signIn('owner@teecloset.co.ke', 'wrong')).rejects.toThrow('Invalid login credentials')
  })
})

describe('signOut', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signs out', async () => {
    ;(supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null })
    await signOut()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})

describe('useAuthSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the current session and stops loading', async () => {
    const fakeSession = { user: { id: 'u1' } }
    ;(supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: fakeSession },
    })
    ;(supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useAuthSession())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.session).toBe(fakeSession)
  })

  it('starts with no session when getSession resolves null', async () => {
    ;(supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { session: null } })
    ;(supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useAuthSession())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.session).toBeNull()
  })
})
