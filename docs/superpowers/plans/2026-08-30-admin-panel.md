# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Tee Closet brand owner a real, authenticated admin area to add/edit/delete products and categories — including uploading their own product photos — without touching code or asking a developer.

**Architecture:** Email/password auth via Supabase Auth, gating a `/admin/*` route tree with its own visually distinct layout (no customer-facing header/footer/cart). All writes go through new React Query mutation hooks added to the existing `categories.ts`/`products.ts` data layer, reusing the read hooks and RLS policies already in place from the Supabase data migration. Photo upload/reorder writes directly to the `product-photos` Storage bucket and `product_images` rows.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, react-router-dom v7, `@supabase/supabase-js`, `@tanstack/react-query` (all already installed) — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-29-supabase-admin-design.md` (this plan implements section 6, admin pages, plus the mutation-side additions to section 5's data layer)

**Builds on:** `docs/superpowers/plans/2026-08-29-supabase-data-migration.md` (already implemented, reviewed, and deployed — the Supabase project, schema, RLS policies, `product-photos` Storage bucket and its policies, and the `service_role`/`anon`/`authenticated` table grants all already exist and are correctly configured)

## Global Constraints

- Node: use Node v22.23.2 for every npm/vite/vitest command — prefix every shell command in this plan with: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH"`
- Every Supabase-backed hook (read or write) must be wrapped in `@tanstack/react-query` (`useQuery` for reads, `useMutation` for writes) — no raw `useEffect`/`useState` data fetching.
- Every mutation must invalidate the relevant query key(s) on success so the UI reflects the change without a manual refetch, and must surface `error` from Supabase (never swallow it) — every admin form must show a write failure as an inline error, never fail silently.
- Every component test that renders a component consuming a Supabase-backed hook must wrap with the existing `QueryWrapper` test helper (`site/src/test/queryWrapper.tsx`) and mock `@/lib/supabaseClient`, following the dispatch-by-table-name mock pattern already established across the codebase (see `site/src/components/home/FeaturedGrid.test.tsx` or `site/src/routes/Shop.test.tsx` for the pattern).
- The admin shell (nav, layout) must be visually distinct from the customer-facing brand pages — it does not render `Header`, `Footer`, `MobileNav`, `WhatsAppFloatingCTA`, or `CartDrawer` from the public `Layout` component. It may reuse the existing design tokens (`site/src/styles/tokens.css`) and the `Button`/`buttonClassName` primitives for visual consistency, but is its own layout tree.
- Product `slug` is immutable after creation — editing a product's name never changes its slug, since slugs are embedded in already-shared WhatsApp links. Slug generation only happens once, at creation time, and is auto-derived + uniqueness-checked (lowercase, hyphenated), never a manual form field.
- Category deletion must be blocked with a friendly, specific error message if any product still references that category's slug — never a cascading delete of products, never a raw database error surfaced to the user.
- Image reordering in this plan uses "move left" / "move right" buttons on each thumbnail, not drag-and-drop — this achieves the same reordering capability the spec calls for without adding a drag-and-drop library dependency, and is simpler to build, test, and use on a phone (the brand owner's most likely device). This is a deliberate implementation choice, not a scope reduction: uploading, removing, and reordering photos are all still fully supported.
- The Supabase project's `authenticated` role already has `select, insert, update, delete` grants on `categories`, `products`, and `product_images` (set up during the data-migration plan's Task 12 troubleshooting) — no new `GRANT` SQL is needed for this plan. The `product-photos` Storage bucket and its public-read/authenticated-write policies also already exist.

---

### Task 1: Create the admin login (human checkpoint)

**Files:** none — this task has no code. It is executed by the controller (you) directly asking the human partner to do this step, not by dispatching an implementer subagent. Creating a real login credential for a real person is outside any subagent's reach.

**Interfaces:**
- Produces: an email + password the human partner will use to sign in at `/admin/login` once Task 3 is built — no value needs to be handed back to the controller, since the deployed site's own login form is where these credentials get used.

- [ ] **Step 1: Ask the human partner to create their admin login**

Present these exact instructions in chat:

1. Go to your Supabase project dashboard → **Authentication** (left sidebar) → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter the email address and password you want to use to log into the Tee Closet admin panel. Leave "Auto Confirm User" checked (so no email verification step is required).
4. Click **Create user**.

- [ ] **Step 2: Confirm and proceed**

Once the human partner confirms the user was created, proceed to Task 2. No credentials need to be shared back with the controller — they're used directly at the login page once it exists.

---

### Task 2: Auth helpers

**Files:**
- Create: `site/src/lib/auth.ts`
- Create: `site/src/lib/auth.test.ts`

**Interfaces:**
- Produces: `signIn(email: string, password: string): Promise<void>`, `signOut(): Promise<void>`, `useAuthSession(): { session: Session | null, isLoading: boolean }` — consumed by Task 3's `AdminRouteGuard` and `AdminLogin`, and by Task 6's admin layout (sign-out button).
- Consumes: `supabase` from `@/lib/supabaseClient` (existing).

- [ ] **Step 1: Write the auth helpers**

Create `site/src/lib/auth.ts`:

```ts
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, isLoading }
}
```

- [ ] **Step 2: Write the tests**

Create `site/src/lib/auth.test.ts`:

```ts
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
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/lib/auth.ts site/src/lib/auth.test.ts
git commit -m "feat: add Supabase auth helpers and session hook"
```

---

### Task 3: `AdminRouteGuard` and `AdminLogin`

**Files:**
- Create: `site/src/components/admin/AdminRouteGuard.tsx`
- Create: `site/src/components/admin/AdminRouteGuard.test.tsx`
- Create: `site/src/routes/admin/AdminLogin.tsx`
- Create: `site/src/routes/admin/AdminLogin.test.tsx`

**Interfaces:**
- Consumes: `useAuthSession`, `signIn` from `@/lib/auth` (Task 2).
- Produces: `AdminRouteGuard` (wraps protected admin routes, redirects to `/admin/login` when unauthenticated), `AdminLogin` (the login page) — both consumed by Task 6's `App.tsx` route wiring.

- [ ] **Step 1: Write `AdminRouteGuard`**

Create `site/src/components/admin/AdminRouteGuard.tsx`:

```tsx
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
```

- [ ] **Step 2: Write `AdminRouteGuard` tests**

Create `site/src/components/admin/AdminRouteGuard.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Write `AdminLogin`**

Create `site/src/routes/admin/AdminLogin.tsx`:

```tsx
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
```

- [ ] **Step 4: Write `AdminLogin` tests**

Create `site/src/routes/admin/AdminLogin.test.tsx`:

```tsx
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
```

- [ ] **Step 5: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add site/src/components/admin/AdminRouteGuard.tsx site/src/components/admin/AdminRouteGuard.test.tsx site/src/routes/admin/AdminLogin.tsx site/src/routes/admin/AdminLogin.test.tsx
git commit -m "feat: add AdminRouteGuard and admin login page"
```

---

### Task 4: Category mutation hooks

**Files:**
- Modify: `site/src/data/categories.ts` (add mutations; do not touch `useCategories`/`getCategoryLabel`)
- Modify: `site/src/data/categories.test.ts` (add new test cases)

**Interfaces:**
- Produces: `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()` — all `useMutation`-based, consumed by Task 7's `AdminCategoryManager`.
- Consumes: `supabase` from `@/lib/supabaseClient`, `useMutation`/`useQueryClient` from `@tanstack/react-query`.

- [ ] **Step 1: Add the mutation hooks**

Modify `site/src/data/categories.ts` — add `useMutation`/`useQueryClient` to the existing `@tanstack/react-query` import, and append this code at the end of the file:

```ts
export interface CategoryInput {
  slug: string
  label: string
  sortOrder: number
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { error } = await supabase
        .from('categories')
        .insert({ slug: input.slug, label: input.label, sort_order: input.sortOrder })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; label: string }) => {
      const { error } = await supabase.from('categories').update({ label: input.label }).eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: { id: string; slug: string }) => {
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category', category.slug)
      if (countError) throw countError
      if (count && count > 0) {
        throw new Error(
          `Can't delete "${category.slug}" — ${count} product${count === 1 ? '' : 's'} still use${count === 1 ? 's' : ''} this category.`,
        )
      }
      const { error } = await supabase.from('categories').delete().eq('id', category.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
```

Update the top of the file so the import reads:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
```

- [ ] **Step 2: Add tests**

Append to `site/src/data/categories.test.ts` (add `renderHook`/`waitFor`/`act` imports if not already present — check the file first):

```ts
import { act } from '@testing-library/react'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from './categories'

describe('useCreateCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserts a category and invalidates the categories query', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useCreateCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ slug: 'jackets', label: 'Jackets', sortOrder: 6 })
    })

    expect(insert).toHaveBeenCalledWith({ slug: 'jackets', label: 'Jackets', sort_order: 6 })
    expect(result.current.isSuccess).toBe(true)
  })

  it('surfaces an insert error', async () => {
    const insert = vi.fn().mockResolvedValue({ error: new Error('duplicate key value') })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useCreateCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ slug: 'blazers', label: 'Blazers', sortOrder: 1 }),
      ).rejects.toThrow('duplicate key value')
    })
  })
})

describe('useUpdateCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates a category label', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const { result } = renderHook(() => useUpdateCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'cat-1', label: 'Outerwear' })
    })

    expect(update).toHaveBeenCalledWith({ label: 'Outerwear' })
    expect(eq).toHaveBeenCalledWith('id', 'cat-1')
  })
})

describe('useDeleteCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a category with no referencing products', async () => {
    const productsEq = vi.fn().mockResolvedValue({ count: 0, error: null })
    const productsSelect = vi.fn().mockReturnValue({ eq: productsEq })
    const categoriesEq = vi.fn().mockResolvedValue({ error: null })
    const categoriesDelete = vi.fn().mockReturnValue({ eq: categoriesEq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) =>
      table === 'products' ? { select: productsSelect } : { delete: categoriesDelete },
    )

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'cat-1', slug: 'jackets' })
    })

    expect(categoriesDelete).toHaveBeenCalled()
    expect(result.current.isSuccess).toBe(true)
  })

  it('blocks deletion with a friendly error when products still reference the category', async () => {
    const productsEq = vi.fn().mockResolvedValue({ count: 3, error: null })
    const productsSelect = vi.fn().mockReturnValue({ eq: productsEq })
    const categoriesDelete = vi.fn()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) =>
      table === 'products' ? { select: productsSelect } : { delete: categoriesDelete },
    )

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: QueryWrapper })

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 'cat-1', slug: 'blazers' })).rejects.toThrow(
        /3 products still use this category/,
      )
    })

    expect(categoriesDelete).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/data/categories.ts site/src/data/categories.test.ts
git commit -m "feat: add category create/update/delete mutation hooks"
```

---

### Task 5: Product mutation and image hooks

**Files:**
- Modify: `site/src/data/products.ts` (add mutations and image hooks; do not touch the existing read hooks)
- Modify: `site/src/data/products.test.ts` (add new test cases)

**Interfaces:**
- Produces: `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`, `useProductImages(productId)`, `useUploadProductImage()`, `useDeleteProductImage()`, `useReorderProductImages()` — consumed by Task 7's `AdminProductList` (delete) and Tasks 10–12's product form/image manager.
- Consumes: `supabase` from `@/lib/supabaseClient`, `useMutation`/`useQuery`/`useQueryClient` from `@tanstack/react-query`.

- [ ] **Step 1: Add the product CRUD mutations and slug generation**

Modify `site/src/data/products.ts` — append this code at the end of the file (the `useMutation`/`useQueryClient` imports were already added by Task 4 to `categories.ts`; add them to `products.ts`'s own `@tanstack/react-query` import too if not already present):

```ts
export interface ProductInput {
  name: string
  category: string
  priceKsh: number
  sizes: Size[]
  colors: string[]
  availability: Availability
  isNew: boolean
  isFeatured: boolean
  description: string
  stylingNote: string
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  let candidate = base
  let suffix = 2
  while (true) {
    const { data, error } = await supabase.from('products').select('id').eq('slug', candidate).maybeSingle()
    if (error) throw error
    if (!data) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

function toRow(input: ProductInput) {
  return {
    name: input.name,
    category: input.category,
    price_ksh: input.priceKsh,
    sizes: input.sizes,
    colors: input.colors,
    availability: input.availability,
    is_new: input.isNew,
    is_featured: input.isFeatured,
    description: input.description,
    styling_note: input.stylingNote,
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const slug = await generateUniqueSlug(input.name)
      const { data, error } = await supabase
        .from('products')
        .insert({ slug, ...toRow(input) })
        .select('id, slug')
        .single()
      if (error) throw error
      return data as { id: string; slug: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: ProductInput & { id: string }) => {
      const { error } = await supabase
        .from('products')
        .update({ ...toRow(input), updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapRow(data as unknown as ProductRow) : null
}

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ['product-by-id', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  })
}
```

`useProductById` is the read hook the admin edit form (Task 12) uses to load a product by its database id (the admin edit route is `/admin/products/:id/edit`, keyed on id, not slug — unlike the public `/product/:slug` route, so it needs its own fetch-by-id path rather than reusing `useProductBySlug`).

- [ ] **Step 2: Add the product-image hooks**

Append to the same file, `site/src/data/products.ts`:

```ts
export interface ProductImageRow {
  id: string
  url: string
  sortOrder: number
}

async function fetchProductImages(productId: string): Promise<ProductImageRow[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('id, url, sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data.map((row) => ({ id: row.id, url: row.url, sortOrder: row.sort_order }))
}

export function useProductImages(productId: string | undefined) {
  return useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => fetchProductImages(productId!),
    enabled: !!productId,
  })
}

export function useUploadProductImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, file, sortOrder }: { productId: string; file: File; sortOrder: number }) => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `products/${productId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('product-photos').upload(path, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('product-photos').getPublicUrl(path)
      const { error: insertError } = await supabase
        .from('product_images')
        .insert({ product_id: productId, url: urlData.publicUrl, sort_order: sortOrder })
      if (insertError) throw insertError
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', variables.productId] })
    },
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ imageId }: { imageId: string; productId: string }) => {
      const { error } = await supabase.from('product_images').delete().eq('id', imageId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', variables.productId] })
    },
  })
}

export function useReorderProductImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, orderedIds }: { productId: string; orderedIds: string[] }) => {
      for (let index = 0; index < orderedIds.length; index += 1) {
        const { error } = await supabase
          .from('product_images')
          .update({ sort_order: index })
          .eq('id', orderedIds[index])
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', variables.productId] })
    },
  })
}
```

- [ ] **Step 3: Add tests**

Append to `site/src/data/products.test.ts` (add `act` to the `@testing-library/react` import if not already present):

```ts
import { act } from '@testing-library/react'
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductById,
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useReorderProductImages,
} from './products'

const PRODUCT_INPUT = {
  name: 'Camel Wide-Leg Trousers',
  category: 'wide-leg',
  priceKsh: 2800,
  sizes: [28, 30, 32] as const,
  colors: ['Camel'],
  availability: 'in-stock' as const,
  isNew: true,
  isFeatured: false,
  description: 'desc',
  stylingNote: 'note',
}

describe('useCreateProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('generates a unique slug and inserts the product', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqSlug = vi.fn().mockReturnValue({ maybeSingle })
    const selectSlug = vi.fn().mockReturnValue({ eq: eqSlug })
    const single = vi.fn().mockResolvedValue({ data: { id: 'p1', slug: 'camel-wide-leg-trousers' }, error: null })
    const selectInsert = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select: selectInsert })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectSlug, insert })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      const created = await result.current.mutateAsync(PRODUCT_INPUT)
      expect(created.slug).toBe('camel-wide-leg-trousers')
    })

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'camel-wide-leg-trousers', name: PRODUCT_INPUT.name }))
  })

  it('appends a numeric suffix when the base slug is taken', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: 'existing' }, error: null })
      .mockResolvedValueOnce({ data: null, error: null })
    const eqSlug = vi.fn().mockReturnValue({ maybeSingle })
    const selectSlug = vi.fn().mockReturnValue({ eq: eqSlug })
    const single = vi.fn().mockResolvedValue({ data: { id: 'p1', slug: 'camel-wide-leg-trousers-2' }, error: null })
    const selectInsert = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select: selectInsert })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectSlug, insert })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync(PRODUCT_INPUT)
    })

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'camel-wide-leg-trousers-2' }))
  })
})

describe('useUpdateProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates a product without changing its slug', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'p1', ...PRODUCT_INPUT })
    })

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ name: PRODUCT_INPUT.name }))
    expect(update.mock.calls[0][0]).not.toHaveProperty('slug')
    expect(eq).toHaveBeenCalledWith('id', 'p1')
  })
})

describe('useDeleteProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a product by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ delete: del })

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync('p1')
    })

    expect(eq).toHaveBeenCalledWith('id', 'p1')
  })
})

describe('useProductById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches a single product by database id', async () => {
    const ROW = {
      id: 'p1',
      slug: 'camel-wide-leg-trousers',
      name: 'Camel Wide-Leg Trousers',
      category: 'wide-leg',
      price_ksh: 2800,
      sizes: [28, 30],
      colors: ['Camel'],
      availability: 'in-stock',
      is_new: true,
      is_featured: false,
      description: 'desc',
      styling_note: 'note',
      product_images: [],
    }
    const maybeSingle = vi.fn().mockResolvedValue({ data: ROW, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductById('p1'), { wrapper: QueryWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('p1')
    expect(eq).toHaveBeenCalledWith('id', 'p1')
  })

  it('does not query when id is undefined', () => {
    const select = vi.fn()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    renderHook(() => useProductById(undefined), { wrapper: QueryWrapper })

    expect(select).not.toHaveBeenCalled()
  })
})

describe('useProductImages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches images ordered by sort_order', async () => {
    const order = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'img1', url: '/a.jpg', sort_order: 0 }], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductImages('p1'), { wrapper: QueryWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 'img1', url: '/a.jpg', sortOrder: 0 }])
  })
})

describe('useUploadProductImage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uploads a file to storage and inserts a product_images row', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/products/p1/x.jpg' } })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.storage as unknown as { from: ReturnType<typeof vi.fn> }) = {
      from: vi.fn().mockReturnValue({ upload, getPublicUrl }),
    } as never
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useUploadProductImage(), { wrapper: QueryWrapper })
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await result.current.mutateAsync({ productId: 'p1', file, sortOrder: 0 })
    })

    expect(upload).toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: 'p1', url: 'https://cdn/products/p1/x.jpg', sort_order: 0 }),
    )
  })
})

describe('useDeleteProductImage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes an image row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ delete: del })

    const { result } = renderHook(() => useDeleteProductImage(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ imageId: 'img1', productId: 'p1' })
    })

    expect(eq).toHaveBeenCalledWith('id', 'img1')
  })
})

describe('useReorderProductImages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates sort_order for each image in the new order', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update })

    const { result } = renderHook(() => useReorderProductImages(), { wrapper: QueryWrapper })

    await act(async () => {
      await result.current.mutateAsync({ productId: 'p1', orderedIds: ['img2', 'img1'] })
    })

    expect(update).toHaveBeenNthCalledWith(1, { sort_order: 0 })
    expect(eq).toHaveBeenNthCalledWith(1, 'id', 'img2')
    expect(update).toHaveBeenNthCalledWith(2, { sort_order: 1 })
    expect(eq).toHaveBeenNthCalledWith(2, 'id', 'img1')
  })
})
```

- [ ] **Step 4: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add site/src/data/products.ts site/src/data/products.test.ts
git commit -m "feat: add product CRUD and product-image mutation hooks"
```

---

### Task 6: Admin layout shell

**Files:**
- Create: `site/src/components/admin/AdminLayout.tsx`
- Create: `site/src/components/admin/AdminLayout.test.tsx`

**Interfaces:**
- Consumes: `signOut` from `@/lib/auth` (Task 2), `buttonClassName` from `@/components/ui/buttonStyles`.
- Produces: `AdminLayout` — consumed by Task 9's `App.tsx` route wiring as the element wrapping every guarded `/admin/*` route via `<Outlet />`.

- [ ] **Step 1: Write `AdminLayout`**

Create `site/src/components/admin/AdminLayout.tsx`:

```tsx
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
```

- [ ] **Step 2: Write tests**

Create `site/src/components/admin/AdminLayout.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/admin/AdminLayout.tsx site/src/components/admin/AdminLayout.test.tsx
git commit -m "feat: add admin layout shell with nav and sign-out"
```

---

### Task 7: `AdminProductList`

**Files:**
- Create: `site/src/components/admin/AdminProductList.tsx`
- Create: `site/src/components/admin/AdminProductList.test.tsx`

**Interfaces:**
- Consumes: `useProducts` (existing), `useDeleteProduct` (Task 5), `useCategories`/`getCategoryLabel` (existing), `formatKsh` from `@/lib/format` (existing).
- Produces: `AdminProductList` — consumed by Task 9's `AdminDashboard`.

- [ ] **Step 1: Write `AdminProductList`**

Create `site/src/components/admin/AdminProductList.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/data/products'
import { useCategories, getCategoryLabel } from '@/data/categories'
import { formatKsh } from '@/lib/format'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'

export function AdminProductList() {
  const { data: products, isLoading, isError } = useProducts()
  const { data: categories } = useCategories()
  const deleteProduct = useDeleteProduct()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleteError(null)
    setDeletingId(id)
    try {
      await deleteProduct.mutateAsync(id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Products</h2>
        <Link to="/admin/products/new" className={buttonClassName('secondary')}>
          Add Product
        </Link>
      </div>

      {deleteError && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {deleteError}
        </p>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-4 text-red-400">Couldn't load products.</p>
      ) : (products ?? []).length === 0 ? (
        <p className="mt-4 text-sand">No products yet.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-taupe text-sand">
              <th className="py-2 font-medium">Name</th>
              <th className="font-medium">Category</th>
              <th className="font-medium">Price</th>
              <th className="font-medium">Availability</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products!.map((product) => (
              <tr key={product.id} className="border-b border-taupe/40">
                <td className="py-2">{product.name}</td>
                <td>{getCategoryLabel(categories ?? [], product.category)}</td>
                <td>{formatKsh(product.priceKsh)}</td>
                <td className="capitalize">{product.availability.replace('-', ' ')}</td>
                <td className="text-right">
                  <Link to={`/admin/products/${product.id}/edit`} className="text-champagne underline">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="ml-4 text-red-400 underline disabled:opacity-50"
                  >
                    {deletingId === product.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write tests**

Create `site/src/components/admin/AdminProductList.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminProductList } from './AdminProductList'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const PRODUCT_ROW = {
  id: 'p1',
  slug: 'camel-wide-leg-trousers',
  name: 'Camel Wide-Leg Trousers',
  category: 'wide-leg',
  price_ksh: 2800,
  sizes: [28, 30],
  colors: ['Camel'],
  availability: 'in-stock',
  is_new: true,
  is_featured: false,
  description: 'desc',
  styling_note: 'note',
  product_images: [],
}

function mockSupabase(products: unknown[] = [PRODUCT_ROW]) {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'products') {
      return { select: vi.fn().mockResolvedValue({ data: products, error: null }) }
    }
    return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
  })
}

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AdminProductList />
    </MemoryRouter>,
    { wrapper: QueryWrapper },
  )
}

describe('AdminProductList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists products with an edit link and a delete button', async () => {
    mockSupabase()
    renderWithProviders()

    expect(await screen.findByText('Camel Wide-Leg Trousers')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/admin/products/p1/edit')
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows an empty state when there are no products', async () => {
    mockSupabase([])
    renderWithProviders()
    expect(await screen.findByText(/no products yet/i)).toBeInTheDocument()
  })

  it('deletes a product after confirming, and shows an error if the delete fails', async () => {
    mockSupabase()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockResolvedValue({ data: [PRODUCT_ROW], error: null }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: new Error('network error') }) }),
        }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })
    renderWithProviders()

    await screen.findByText('Camel Wide-Leg Trousers')
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
  })
})
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/admin/AdminProductList.tsx site/src/components/admin/AdminProductList.test.tsx
git commit -m "feat: add admin product list with delete"
```

---

### Task 8: `AdminCategoryManager`

**Files:**
- Create: `site/src/components/admin/AdminCategoryManager.tsx`
- Create: `site/src/components/admin/AdminCategoryManager.test.tsx`

**Interfaces:**
- Consumes: `useCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` (Task 4, existing).
- Produces: `AdminCategoryManager` — consumed by Task 9's `AdminDashboard`.

- [ ] **Step 1: Write `AdminCategoryManager`**

Create `site/src/components/admin/AdminCategoryManager.tsx`:

```tsx
import { useState, type FormEvent } from 'react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/data/categories'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AdminCategoryManager() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const label = newLabel.trim()
    if (!label) return
    try {
      await createCategory.mutateAsync({
        slug: slugify(label),
        label,
        sortOrder: categories?.length ?? 0,
      })
      setNewLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category.')
    }
  }

  function startEditing(id: string, currentLabel: string) {
    setEditingId(id)
    setEditingLabel(currentLabel)
    setError(null)
  }

  async function handleRename(id: string) {
    setError(null)
    try {
      await updateCategory.mutateAsync({ id, label: editingLabel.trim() })
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename category.')
    }
  }

  async function handleDelete(id: string, slug: string, label: string) {
    if (!window.confirm(`Delete "${label}"?`)) return
    setError(null)
    try {
      await deleteCategory.mutateAsync({ id, slug })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl">Categories</h2>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {(categories ?? []).map((category) => (
            <li key={category.id} className="flex items-center gap-3 rounded-md border border-taupe/60 px-3 py-2">
              {editingId === category.id ? (
                <>
                  <input
                    aria-label={`Rename ${category.label}`}
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    className="flex-1 rounded-md border border-taupe bg-mocha px-2 py-1 text-ivory"
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(category.id)}
                    className="text-champagne underline"
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-sand underline">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{category.label}</span>
                  <button
                    type="button"
                    onClick={() => startEditing(category.id, category.label)}
                    className="text-champagne underline"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id, category.slug, category.label)}
                    className="text-red-400 underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="mt-4 flex gap-2">
        <input
          aria-label="New category name"
          placeholder="New category name"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
        <button type="submit" className={buttonClassName('secondary')} disabled={createCategory.isPending}>
          Add
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Write tests**

Create `site/src/components/admin/AdminCategoryManager.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminCategoryManager } from './AdminCategoryManager'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const CATEGORY_ROW = { id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }

function mockSupabase(overrides?: {
  onInsert?: () => { error: Error | null }
  onUpdate?: () => { error: Error | null }
  onDeleteCount?: number
}) {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'categories') {
      return {
        select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [CATEGORY_ROW], error: null }) }),
        insert: vi.fn().mockResolvedValue(overrides?.onInsert?.() ?? { error: null }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue(overrides?.onUpdate?.() ?? { error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }
    }
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ count: overrides?.onDeleteCount ?? 0, error: null }) }),
    }
  })
}

function renderManager() {
  return render(<AdminCategoryManager />, { wrapper: QueryWrapper })
}

describe('AdminCategoryManager', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists existing categories', async () => {
    mockSupabase()
    renderManager()
    expect(await screen.findByText('Blazers')).toBeInTheDocument()
  })

  it('adds a new category', async () => {
    mockSupabase()
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.type(screen.getByLabelText(/new category name/i), 'Jackets')
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }))

    expect(supabase.from).toHaveBeenCalledWith('categories')
  })

  it('renames a category', async () => {
    mockSupabase()
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.click(screen.getByRole('button', { name: /rename/i }))
    const input = screen.getByLabelText(/rename Blazers/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Outerwear')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.queryByLabelText(/rename Blazers/i)).not.toBeInTheDocument()
  })

  it('shows a friendly error when deleting a category still in use', async () => {
    mockSupabase({ onDeleteCount: 2 })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderManager()
    await screen.findByText('Blazers')

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/2 products still use this category/i)
  })
})
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/admin/AdminCategoryManager.tsx site/src/components/admin/AdminCategoryManager.test.tsx
git commit -m "feat: add admin category manager with add/rename/delete"
```

---

### Task 9: `AdminDashboard` route and wiring all admin routes into `App.tsx`

**Files:**
- Create: `site/src/routes/admin/AdminDashboard.tsx`
- Create: `site/src/routes/admin/AdminDashboard.test.tsx`
- Modify: `site/src/App.tsx`
- Modify: `site/src/App.test.tsx`

**Interfaces:**
- Consumes: `AdminProductList` (Task 7), `AdminCategoryManager` (Task 8), `AdminRouteGuard` (Task 3), `AdminLayout` (Task 6), `AdminLogin` (Task 3).
- Produces: `AdminDashboard` — the `/admin` index route. Task 12 will later add two more child routes (`products/new`, `products/:id/edit`) inside the same guarded `<Route path="/admin">` block this task creates.

- [ ] **Step 1: Write `AdminDashboard`**

Create `site/src/routes/admin/AdminDashboard.tsx`:

```tsx
import { AdminProductList } from '@/components/admin/AdminProductList'
import { AdminCategoryManager } from '@/components/admin/AdminCategoryManager'

export function AdminDashboard() {
  return (
    <div>
      <AdminProductList />
      <AdminCategoryManager />
    </div>
  )
}
```

- [ ] **Step 2: Write `AdminDashboard` tests**

Create `site/src/routes/admin/AdminDashboard.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminDashboard } from './AdminDashboard'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'products') {
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })
  })

  it('renders both the product list and category manager sections', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
      { wrapper: QueryWrapper },
    )

    expect(await screen.findByRole('heading', { name: /^products$/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /^categories$/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Wire the admin routes into `App.tsx`**

Modify `site/src/App.tsx` — add the admin imports and routes, leaving the existing public routes untouched:

```tsx
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/routes/Home'
import { Shop } from '@/routes/Shop'
import { ProductDetail } from '@/routes/ProductDetail'
import { NotFound } from '@/routes/NotFound'
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminLogin } from '@/routes/admin/AdminLogin'
import { AdminDashboard } from '@/routes/admin/AdminDashboard'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 4: Extend `App.test.tsx`**

Read the current `site/src/App.test.tsx` first (it has one existing test, `renders the Tee Closet brand name`, using a `mockCategories()` helper — leave that test and helper exactly as they are). Add a `vi.mock('@/lib/auth', ...)` mock and two new tests for the admin routes, which don't render `Home`/`ProductCard` so they don't need the categories/products mock at all:

```tsx
import { useAuthSession } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  useAuthSession: vi.fn(),
  signIn: vi.fn(),
}))

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
```

Add these as a new top-level `describe` block alongside the existing `describe('App', ...)` block — do not merge them or remove the existing test/helper.

- [ ] **Step 5: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add site/src/routes/admin/AdminDashboard.tsx site/src/routes/admin/AdminDashboard.test.tsx site/src/App.tsx site/src/App.test.tsx
git commit -m "feat: wire admin routes (login, guarded dashboard) into App"
```

---

### Task 10: `ProductForm` component

**Files:**
- Create: `site/src/components/admin/ProductForm.tsx`
- Create: `site/src/components/admin/ProductForm.test.tsx`

**Interfaces:**
- Consumes: `useCategories` (existing), `ProductInput` type (Task 5), `Availability`/`Size` types from `@/data/types` (existing).
- Produces: `ProductForm` — a controlled, presentational form (no Supabase calls of its own) taking `{ initialValues?, onSubmit, isSubmitting, submitLabel }`. Consumed by Task 12's `AdminProductForm` route, which owns the actual create/update mutation.

This component does not touch photos — that's Task 11, added as a sibling section inside the same page by Task 12, not inside this form component.

- [ ] **Step 1: Write `ProductForm`**

Create `site/src/components/admin/ProductForm.tsx`:

```tsx
import { useState, type FormEvent } from 'react'
import { useCategories } from '@/data/categories'
import type { Availability, Size } from '@/data/types'
import type { ProductInput } from '@/data/products'
import { Button } from '@/components/ui/Button'

const ALL_SIZES: Size[] = [26, 28, 30, 32, 34, 36, 38, 40]
const AVAILABILITIES: Availability[] = ['in-stock', 'limited', 'sold']

interface ProductFormProps {
  initialValues?: Partial<ProductInput>
  onSubmit: (input: ProductInput) => void | Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export function ProductForm({ initialValues, onSubmit, isSubmitting, submitLabel }: ProductFormProps) {
  const { data: categories } = useCategories()

  const [name, setName] = useState(initialValues?.name ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [priceKsh, setPriceKsh] = useState(initialValues?.priceKsh?.toString() ?? '')
  const [sizes, setSizes] = useState<Size[]>(initialValues?.sizes ?? [])
  const [colorsText, setColorsText] = useState((initialValues?.colors ?? []).join(', '))
  const [availability, setAvailability] = useState<Availability>(initialValues?.availability ?? 'in-stock')
  const [isNew, setIsNew] = useState(initialValues?.isNew ?? false)
  const [isFeatured, setIsFeatured] = useState(initialValues?.isFeatured ?? false)
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [stylingNote, setStylingNote] = useState(initialValues?.stylingNote ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)

  function toggleSize(size: Size) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b),
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError(null)

    const trimmedName = name.trim()
    const price = Number(priceKsh)
    const colors = colorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    if (!trimmedName) return setValidationError('Name is required.')
    if (!category) return setValidationError('Category is required.')
    if (!Number.isFinite(price) || price <= 0) return setValidationError('Price must be a positive number.')
    if (sizes.length === 0) return setValidationError('Select at least one size.')

    onSubmit({
      name: trimmedName,
      category,
      priceKsh: price,
      sizes,
      colors,
      availability,
      isNew,
      isFeatured,
      description: description.trim(),
      stylingNote: stylingNote.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <label htmlFor="product-name" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Name
        </label>
        <input
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <label htmlFor="product-category" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Category
        </label>
        <select
          id="product-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        >
          <option value="">Select a category</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="product-price" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Price (KSh)
        </label>
        <input
          id="product-price"
          type="number"
          min="0"
          value={priceKsh}
          onChange={(e) => setPriceKsh(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-sand">Sizes</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {ALL_SIZES.map((size) => (
            <label key={size} className="flex items-center gap-1 text-sm text-ivory">
              <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleSize(size)} />
              {size}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="product-colors" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Colors (comma-separated)
        </label>
        <input
          id="product-colors"
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <label htmlFor="product-availability" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Availability
        </label>
        <select
          id="product-availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as Availability)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        >
          {AVAILABILITIES.map((a) => (
            <option key={a} value={a}>
              {a.replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> New
        </label>
        <label className="flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
        </label>
      </div>

      <div>
        <label htmlFor="product-description" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Description
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <label htmlFor="product-styling-note" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Styling Note
        </label>
        <textarea
          id="product-styling-note"
          value={stylingNote}
          onChange={(e) => setStylingNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      {validationError && (
        <p role="alert" className="text-sm text-red-400">
          {validationError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Write tests**

Create `site/src/components/admin/ProductForm.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductForm } from './ProductForm'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({
    data: [
      { id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 },
      { id: 'c2', slug: 'tops', label: 'Tops', sort_order: 1 },
    ],
    error: null,
  })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('ProductForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a validation error and does not call onSubmit when required fields are missing', async () => {
    mockCategories()
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create" />, { wrapper: QueryWrapper })

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/name is required/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a fully-filled form with the correct shape', async () => {
    mockCategories()
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create" />, { wrapper: QueryWrapper })

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Camel Wide-Leg Trousers')
    await userEvent.selectOptions(await screen.findByLabelText(/category/i), 'blazers')
    await userEvent.type(screen.getByLabelText(/price/i), '2800')
    await userEvent.click(screen.getByLabelText('30'))
    await userEvent.click(screen.getByLabelText('32'))
    await userEvent.type(screen.getByLabelText(/colors/i), 'Camel, Sand')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Camel Wide-Leg Trousers',
        category: 'blazers',
        priceKsh: 2800,
        sizes: [30, 32],
        colors: ['Camel', 'Sand'],
        availability: 'in-stock',
        isNew: false,
        isFeatured: false,
      }),
    )
  })

  it('pre-fills fields from initialValues for editing', async () => {
    mockCategories()
    render(
      <ProductForm
        initialValues={{
          name: 'Espresso Tailored Blazer',
          category: 'blazers',
          priceKsh: 3500,
          sizes: [32, 34],
          colors: ['Espresso Black'],
          availability: 'in-stock',
          isNew: true,
          isFeatured: true,
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Save Changes"
      />,
      { wrapper: QueryWrapper },
    )

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('Espresso Tailored Blazer')
    expect(screen.getByLabelText(/price/i)).toHaveValue(3500)
    expect(screen.getByLabelText('32')).toBeChecked()
    expect(screen.getByLabelText(/^new$/i)).toBeChecked()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/admin/ProductForm.tsx site/src/components/admin/ProductForm.test.tsx
git commit -m "feat: add ProductForm with validation for create and edit"
```

---

### Task 11: `ProductImageManager` (upload, remove, reorder)

**Files:**
- Create: `site/src/components/admin/ProductImageManager.tsx`
- Create: `site/src/components/admin/ProductImageManager.test.tsx`

**Interfaces:**
- Consumes: `useProductImages`, `useUploadProductImage`, `useDeleteProductImage`, `useReorderProductImages` (Task 5).
- Produces: `ProductImageManager` — consumed by Task 12's `AdminProductForm` route (rendered only once a product id exists — i.e. after creation, or when editing an existing product; a brand-new product with no id yet can't have photos attached, since `product_images` rows need a real `product_id`).

Reordering uses "move left"/"move right" buttons per the Global Constraints, not drag-and-drop.

- [ ] **Step 1: Write `ProductImageManager`**

Create `site/src/components/admin/ProductImageManager.tsx`:

```tsx
import { useRef, useState } from 'react'
import {
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useReorderProductImages,
} from '@/data/products'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'

interface ProductImageManagerProps {
  productId: string
}

export function ProductImageManager({ productId }: ProductImageManagerProps) {
  const { data: images, isLoading } = useProductImages(productId)
  const uploadImage = useUploadProductImage()
  const deleteImage = useDeleteProductImage()
  const reorderImages = useReorderProductImages()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setIsUploading(true)
    try {
      const startingOrder = images?.length ?? 0
      for (let i = 0; i < files.length; i += 1) {
        await uploadImage.mutateAsync({ productId, file: files[i], sortOrder: startingOrder + i })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemove(imageId: string) {
    setError(null)
    try {
      await deleteImage.mutateAsync({ imageId, productId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo.')
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    if (!images) return
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setError(null)
    try {
      await reorderImages.mutateAsync({ productId, orderedIds: reordered.map((img) => img.id) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder photos.')
    }
  }

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-sand">Photos</p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-2 flex gap-3">
          <Skeleton className="h-24 w-20" />
          <Skeleton className="h-24 w-20" />
        </div>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-3">
          {(images ?? []).map((image, index) => (
            <li key={image.id} className="flex flex-col items-center gap-1">
              <img src={image.url} alt="" className="h-24 w-20 rounded-md object-cover" />
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move photo left"
                  className="text-sand underline disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === (images?.length ?? 0) - 1}
                  aria-label="Move photo right"
                  className="text-sand underline disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  aria-label="Remove photo"
                  className="text-red-400 underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className={buttonClassName('secondary', 'mt-4 inline-flex cursor-pointer')}>
        {isUploading ? 'Uploading…' : 'Add Photos'}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Write tests**

Create `site/src/components/admin/ProductImageManager.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductImageManager } from './ProductImageManager'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}))

const IMAGES = [
  { id: 'img1', url: 'https://cdn/a.jpg', sort_order: 0 },
  { id: 'img2', url: 'https://cdn/b.jpg', sort_order: 1 },
]

function mockImages(images: typeof IMAGES = IMAGES) {
  const order = vi.fn().mockResolvedValue({ data: images, error: null })
  const eq = vi.fn().mockReturnValue({ order })
  const select = vi.fn().mockReturnValue({ eq })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('ProductImageManager', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing photos with move and remove controls', async () => {
    mockImages()
    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })

    expect(await screen.findAllByRole('img')).toHaveLength(2)
    expect(screen.getAllByLabelText('Remove photo')).toHaveLength(2)
  })

  it('disables "move left" on the first photo and "move right" on the last photo', async () => {
    mockImages()
    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })

    await screen.findAllByRole('img')
    const leftButtons = screen.getAllByLabelText('Move photo left')
    const rightButtons = screen.getAllByLabelText('Move photo right')

    expect(leftButtons[0]).toBeDisabled()
    expect(rightButtons[rightButtons.length - 1]).toBeDisabled()
    expect(rightButtons[0]).not.toBeDisabled()
  })

  it('uploads a selected file', async () => {
    mockImages([])
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/new.jpg' } })
    ;(supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue({ upload, getPublicUrl })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }),
      insert,
    }))

    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/add photos/i).parentElement!.querySelector('input[type="file"]')!
    await userEvent.upload(input as HTMLInputElement, file)

    expect(upload).toHaveBeenCalled()
  })

  it('removes a photo', async () => {
    mockImages()
    const del = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: IMAGES, error: null }) }) }),
      delete: del,
    }))

    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })
    await screen.findAllByRole('img')

    await userEvent.click(screen.getAllByLabelText('Remove photo')[0])

    expect(del).toHaveBeenCalled()
  })

  it('reorders photos when "move right" is clicked', async () => {
    mockImages()
    const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: IMAGES, error: null }) }) }),
      update,
    }))

    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })
    await screen.findAllByRole('img')

    await userEvent.click(screen.getAllByLabelText('Move photo right')[0])

    expect(update).toHaveBeenCalledWith({ sort_order: 0 })
  })
})
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/admin/ProductImageManager.tsx site/src/components/admin/ProductImageManager.test.tsx
git commit -m "feat: add ProductImageManager with upload, remove, and reorder"
```

---

### Task 12: `AdminProductForm` route (create + edit) and final route wiring

**Files:**
- Create: `site/src/routes/admin/AdminProductForm.tsx`
- Create: `site/src/routes/admin/AdminProductForm.test.tsx`
- Modify: `site/src/App.tsx`

**Interfaces:**
- Consumes: `useProductById`, `useCreateProduct`, `useUpdateProduct` (Task 5), `ProductForm` (Task 10), `ProductImageManager` (Task 11).
- Produces: `AdminProductForm` — wired to both `/admin/products/new` and `/admin/products/:id/edit` (the presence of the `:id` route param is what distinguishes create vs. edit mode).

A brand-new product has no id until it's saved once, so photos can't be attached until then — after a successful create, this component stays on the page (rather than navigating away like edit mode does) so the owner can immediately add photos to the product they just created.

- [ ] **Step 1: Write `AdminProductForm`**

Create `site/src/routes/admin/AdminProductForm.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductById, useCreateProduct, useUpdateProduct, type ProductInput } from '@/data/products'
import { ProductForm } from '@/components/admin/ProductForm'
import { ProductImageManager } from '@/components/admin/ProductImageManager'

export function AdminProductForm() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id
  const navigate = useNavigate()

  const { data: existingProduct, isLoading } = useProductById(id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  async function handleSubmit(input: ProductInput) {
    setSubmitError(null)
    try {
      if (isEditMode && id) {
        await updateProduct.mutateAsync({ id, ...input })
        navigate('/admin')
      } else {
        const created = await createProduct.mutateAsync(input)
        setCreatedId(created.id)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product.')
    }
  }

  if (isEditMode && isLoading) {
    return <p className="text-sand">Loading…</p>
  }

  if (isEditMode && !existingProduct) {
    return <p className="text-red-400">Product not found.</p>
  }

  const activeProductId = isEditMode ? id! : createdId

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>

      <ProductForm
        initialValues={existingProduct ?? undefined}
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
        submitLabel={isEditMode ? 'Save Changes' : 'Create Product'}
      />

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {submitError}
        </p>
      )}

      {activeProductId ? (
        <ProductImageManager productId={activeProductId} />
      ) : (
        <p className="mt-6 text-sm text-sand">Save the product first to add photos.</p>
      )}

      {!isEditMode && createdId && (
        <button type="button" onClick={() => navigate('/admin')} className="mt-6 text-champagne underline">
          Done — back to dashboard
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write tests**

Create `site/src/routes/admin/AdminProductForm.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { AdminProductForm } from './AdminProductForm'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}))

function mockCategoriesAndEmptyImages() {
  ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === 'categories') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }],
            error: null,
          }),
        }),
      }
    }
    if (table === 'product_images') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }
    }
    return { select: vi.fn() }
  })
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
        <Route path="/admin" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: QueryWrapper },
  )
}

describe('AdminProductForm — create mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a product, then shows the image manager and a Done link instead of navigating away', async () => {
    mockCategoriesAndEmptyImages()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }],
              error: null,
            }),
          }),
        }
      }
      if (table === 'products') {
        return {
          select: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'p1', slug: 'test-blazer' }, error: null }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }
    })

    renderAt('/admin/products/new')

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Test Blazer')
    await userEvent.selectOptions(await screen.findByLabelText(/category/i), 'blazers')
    await userEvent.type(screen.getByLabelText(/price/i), '3000')
    await userEvent.click(screen.getByLabelText('32'))
    await userEvent.click(screen.getByRole('button', { name: /create product/i }))

    expect(await screen.findByText(/done — back to dashboard/i)).toBeInTheDocument()
    expect(screen.queryByText(/save the product first/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByText(/done — back to dashboard/i))
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  })
})

describe('AdminProductForm — edit mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and pre-fills an existing product, then navigates to the dashboard after saving', async () => {
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 }],
              error: null,
            }),
          }),
        }
      }
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'p1',
                  slug: 'espresso-tailored-blazer',
                  name: 'Espresso Tailored Blazer',
                  category: 'blazers',
                  price_ksh: 3500,
                  sizes: [32, 34],
                  colors: ['Espresso Black'],
                  availability: 'in-stock',
                  is_new: true,
                  is_featured: true,
                  description: 'desc',
                  styling_note: 'note',
                  product_images: [],
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }
    })

    renderAt('/admin/products/p1/edit')

    expect(await screen.findByLabelText(/^name$/i)).toHaveValue('Espresso Tailored Blazer')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  })

  it('shows a not-found message when the product id does not exist', async () => {
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
      }
      if (table === 'products') {
        return {
          select: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
        }
      }
      return { select: vi.fn() }
    })

    renderAt('/admin/products/missing/edit')

    expect(await screen.findByText(/product not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Wire the final two routes into `App.tsx`**

Modify `site/src/App.tsx` — add the import and the two child routes inside the existing guarded `<Route path="/admin">` block from Task 9:

```tsx
import { AdminProductForm } from '@/routes/admin/AdminProductForm'
```

```tsx
      <Route
        path="/admin"
        element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
      </Route>
```

- [ ] **Step 4: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add site/src/routes/admin/AdminProductForm.tsx site/src/routes/admin/AdminProductForm.test.tsx site/src/App.tsx
git commit -m "feat: add AdminProductForm route and wire create/edit URLs"
```

---

### Task 13: Final verification and deploy

**Files:** none (verification and deployment only)

**Interfaces:** none new.

- [ ] **Step 1: Full local check**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS.

- [ ] **Step 2: Run the site locally and browser-check the golden admin path**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm run dev` (in the background), then in a browser:
- Visit `/admin` while signed out — confirm it redirects to `/admin/login`.
- Sign in with the credentials created in Task 1.
- Confirm the dashboard shows the real product list (20 products) and category list (6 categories).
- Add a new category (e.g. "Jackets"), confirm it appears in the list.
- Try deleting a category that's still in use by a product (e.g. "Blazers") — confirm the friendly "still in use" error, not a crash.
- Delete the "Jackets" category you just added (unused, should succeed).
- Click "Add Product", fill in the form (name, category, price, at least one size, colors, availability), submit — confirm it saves, and the photo section appears.
- Upload 1–2 real photos, confirm thumbnails appear; try moving one with the arrow buttons; confirm the order persists after a refresh.
- Click "Done — back to dashboard", confirm the new product appears in the list.
- Click "Edit" on that new product, confirm every field (including photos) loads correctly; change the price; save; confirm it navigates back and the new price shows in the list.
- Open the **public** site (`/shop` and the new product's `/product/:slug` page) in the same browser session and confirm the new product appears there too, with its photos.
- Delete the test product from the admin dashboard; confirm it disappears from both the admin list and the public site.
- Sign out; confirm `/admin` redirects to login again.
- Stop the dev server when done.

- [ ] **Step 3: Push and verify the live deploy**

Confirm with the human partner before pushing (this affects the shared/production branch). Push to `origin/master`, wait for the Vercel deploy, then repeat the golden-path check from Step 2 against the live production URL — including actually adding and then deleting a real test product, to confirm Storage uploads and RLS-gated writes both work correctly against production, not just against `localhost`.

- [ ] **Step 4: Report completion**

Confirm to the human partner: the admin panel is live, they can add/edit/delete products and categories with photos from any browser without needing a developer, and both plans from the Supabase migration are now fully complete.
