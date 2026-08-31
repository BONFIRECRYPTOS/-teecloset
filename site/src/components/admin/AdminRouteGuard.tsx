import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '@/lib/auth'

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuthSession()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mocha text-ivory">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
