import { Link, NavLink, Outlet } from 'react-router-dom'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/cn'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-mocha text-ivory">
      <header className="border-b border-taupe px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/admin" className="font-display text-lg">
            Tee Closet Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => cn('hover:text-champagne', isActive ? 'text-champagne' : 'text-sand')}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/products/new"
              className={({ isActive }) => cn('hover:text-champagne', isActive ? 'text-champagne' : 'text-sand')}
            >
              Add Product
            </NavLink>
            <button type="button" onClick={() => signOut()} className="text-sand underline hover:text-champagne">
              Sign Out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
