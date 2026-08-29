# Tee Closet Supabase Backend & Admin Panel — Design Spec

**Date:** 2026-08-29
**Status:** Approved for implementation planning
**Builds on:** `docs/superpowers/specs/2026-08-28-teecloset-website-design.md` (the original site build)

## 1. Goal

Give the brand owner a real admin page to add/edit/delete products and categories — including uploading their own product photos — without touching code, replacing the current hardcoded mock catalog (`site/src/data/products.ts`) with a Supabase-backed database while keeping the public-facing site's architecture, routes, and every existing component untouched in shape.

## 2. Why this shape

The original build's data layer was deliberately designed for this swap: every component reaches products only through `getProducts()` / `getProductBySlug()` / `getRelatedProducts()` / `getCategoryLabel()` — never the raw array. This spec replaces those functions' *implementation* (Supabase queries instead of an in-memory array) without changing their *contract* in a way that breaks consuming components' shape expectations (a `Product` object still has the same fields). The one real ripple: those functions become asynchronous (network calls), so consuming components need a loading state, which they don't need today.

## 3. Architecture

- **No new hosting model.** The site stays a static Vite/React SPA deployed on Vercel exactly as today. Supabase is an external API the browser calls directly (Supabase's model: public anon key ships in the browser bundle by design; security comes from Row Level Security policies on the database, not from hiding the key).
- **New dependencies:** `@supabase/supabase-js` (official client) and `@tanstack/react-query` (server-state caching/loading/error handling — justified because ~8 existing components would otherwise each hand-roll the same loading/error boilerplate; this is the standard, minimal-footprint tool for exactly this problem).
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — read via Vite's `import.meta.env`. Added to `site/.env.local` (gitignored) for local dev and to Vercel's project environment variables for production. `.env.local` must be added to `site/.gitignore` (not currently present).
- **Manual, human-only step:** creating the actual Supabase project (account signup, project creation, running the schema SQL, retrieving the URL/anon key) cannot be automated — the implementation plan has an early task that stops and asks the brand owner to do this and hand back the two values.

## 4. Data model (Postgres, via Supabase)

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  price_ksh int not null,
  sizes int[] not null,
  colors text[] not null default '{}',
  availability text not null check (availability in ('in-stock', 'limited', 'sold')),
  is_new boolean not null default false,
  is_featured boolean not null default false,
  description text not null default '',
  styling_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
```

One row per photo in `product_images` (not an array column) so the admin UI can add/remove/reorder individual images cleanly.

**Row Level Security** (enabled on all three tables): anyone (including anonymous visitors) can `select`; only an authenticated user can `insert`/`update`/`delete`.

```sql
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read product_images" on product_images for select using (true);

create policy "admin write categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write product_images" on product_images for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

**Storage:** one public bucket `product-photos`. Read is public; upload/delete requires an authenticated session (Storage policy mirrors the table policies above).

## 5. Frontend data layer

- `site/src/lib/supabaseClient.ts` — creates and exports a single `supabase` client instance from the env vars.
- `site/src/data/types.ts` — `Product`/`Category`/etc. keep the same field shape the rest of the app already expects (`images: string[]` is still a flat array on the returned object — the `product_images` join is flattened into it before the object reaches components).
- `site/src/data/products.ts` and `site/src/data/categories.ts` — rewritten to query Supabase, exposed as React Query hooks: `useProducts(filters)`, `useProductBySlug(slug)`, `useRelatedProducts(product)`, `useCategories()`. Every current call site (`Shop.tsx`, `Home.tsx`'s sections, `ProductDetail.tsx`, `CategoryGrid.tsx`) switches from a synchronous inline call to consuming `{ data, isLoading, error }` from the corresponding hook.
- **Loading state:** the existing-but-unused `Skeleton` component (built in the original site, never consumed) renders while `isLoading` — the first real use of it.
- **Error state:** network/query failures reuse the existing `EmptyState` component with a friendly message, not a raw error dump. The existing `ErrorBoundary` still catches unexpected render errors.
- Components that only consume a `Product`/`Category` object's *shape* (`ProductCard`, `ProductGallery`, `SizePicker`, the cart, etc.) do not change at all.

## 6. Admin pages

| Route | Purpose |
|---|---|
| `/admin/login` | Email + password sign-in via `supabase.auth.signInWithPassword` |
| `/admin` | Dashboard: product list (edit/delete), category list (add/rename/delete) |
| `/admin/products/new` | Add-product form |
| `/admin/products/:id/edit` | Edit-product form (same form, pre-filled) |

- **Route guard:** a wrapper component checks `supabase.auth.getSession()` on mount; redirects to `/admin/login` if no session, and subscribes to `onAuthStateChange` so a sign-out or expired session redirects live.
- **Product form fields:** name, category (dropdown sourced from `useCategories()`), price (KSh), sizes (checkboxes 26–40), colors (simple tag input), availability (select: in-stock/limited/sold), New/Featured (checkboxes), description, styling note, and a photo section (multi-file upload to the `product-photos` bucket, thumbnail preview, drag-to-reorder, remove — writes/reorders rows in `product_images`).
- **Category management:** a simple list with inline rename and delete (delete blocked with a friendly error if products still reference it — no cascading product deletion from a category delete).
- **Visual treatment:** reuses the site's existing design tokens/`Button`/form patterns for consistency, but the admin shell (nav, layout) is visually distinct from the customer-facing brand pages — this is a working tool, not a marketing surface.
- **Slug generation:** auto-derived from the product name on save (lowercase, hyphenated, uniqueness-checked against existing slugs), matching the existing slug format (`espresso-tailored-blazer`) — no manual slug field in the form.

## 7. Migration

A one-time Node script (`site/scripts/seed-supabase.ts`, run locally with `tsx`, not part of the deployed app) reads the current `PRODUCTS` array and `CATEGORIES` array verbatim and inserts them into Supabase — same 20 products, same 6 categories, same slugs — so the live site's content doesn't change the moment the data layer cuts over. Existing photos already in `site/public/products/` are uploaded into the `product-photos` bucket by the same script, and the seeded products' `product_images` rows point at their new Supabase Storage URLs (replacing the `/products/*.jpg` public-folder paths). After migration, `site/src/data/products.ts`'s old hardcoded `PRODUCTS` array is deleted — Supabase is the only source of truth going forward.

## 8. Testing

Same Vitest + Testing Library approach as the rest of the codebase. New coverage: the Supabase-backed data hooks (mocked Supabase client, verifying correct query/filter construction), the admin auth guard, and the product/category forms (validation, submit, error display). Existing tests that touch the data layer (roughly the majority of the ~95-test suite, since almost every component test renders something backed by product data) need to move from synchronous assertions to `waitFor`/`findBy*`-style async assertions, and from directly rendering components to wrapping them in a `QueryClientProvider` test helper — a real but mechanical migration, not a redesign of what's being tested.

## 9. Non-functional requirements

- Admin write failures (RLS rejection, network error, upload failure) show an inline form error — never a silent failure.
- Auth session expiry redirects to `/admin/login` automatically rather than showing a broken admin page.
- Public pages degrade gracefully on a Supabase outage: `EmptyState`-style messaging, not a blank screen or thrown error.

## 10. Out of scope this round

Editing homepage copy/hero image through the admin (stays code-based), multiple admin permission levels (single admin role only), checkout/payments (still WhatsApp-only, unchanged), analytics/reporting on the admin dashboard.
