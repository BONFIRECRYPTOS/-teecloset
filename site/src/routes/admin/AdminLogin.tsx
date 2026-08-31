import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { signIn, useAuthSession } from '@/lib/auth'
import { Button } from '@/components/ui/Button'

export function AdminLogin() {
  const { session } = useAuthSession()
  const location = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) {
    return <Navigate to={location.state?.from ?? '/admin'} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await signIn(email, password)
    } catch {
      setError('Incorrect email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mocha px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-taupe bg-espresso p-8">
        <h1 className="font-display text-2xl text-ivory">Tee Closet Admin</h1>
        <div className="mt-6">
          <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-sand">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-sand">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
          />
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
