# Supabase Data Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Tee Closet's hardcoded product/category catalog with a Supabase-backed database, so the public site renders the exact same 20 products and 6 categories it does today — now from a real database — with every consuming component handling loading/error states. This is the foundation the admin panel (a separate, later plan) will be built on.

**Architecture:** Add `@supabase/supabase-js` + `@tanstack/react-query`. Seed a new Supabase project with the current catalog (products, categories, images uploaded to Storage) via a one-time script. Add new React Query hooks to `products.ts`/`categories.ts` alongside the existing synchronous functions, then migrate each consuming component from the old sync call to the new hook one at a time (each migration is its own reviewable task), finishing with a cleanup task that deletes the now-unused old code.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, react-router-dom v7, zustand v5 (existing) + `@supabase/supabase-js`, `@tanstack/react-query`, `tsx` (new, for the seed script only)

**Spec:** `docs/superpowers/specs/2026-08-29-supabase-admin-design.md` (this plan implements spec sections 3, 4, 5, and 7; admin UI — section 6 — is a separate follow-up plan)

## Global Constraints

- Node: use Node v22.23.2 for every npm/vite/vitest command — the system default `node` (v20.14.0) is too old for this toolchain. Prefix every shell command in this plan with: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH"`
- WhatsApp order number is `254714743575` — do not touch it in this plan (unrelated to data migration).
- `products.category` is a plain `text` column (NOT a foreign key to `categories.id`) — this was corrected from the original spec draft specifically so Supabase JS client filter queries (`.eq('category', slug)`) stay simple, with no `!inner` join-filter syntax needed.
- Every Supabase-backed hook must be wrapped in `@tanstack/react-query`'s `useQuery` — no raw `useEffect` + `useState` data fetching.
- Every component test that renders a component consuming a Supabase-backed hook must wrap with the `QueryWrapper` test helper (Task 2) and use `findBy*`/`waitFor`, not synchronous `getBy*`, for data that depends on the query resolving.
- Do not delete the old synchronous `getProducts`/`getProductBySlug`/`getRelatedProducts`/`PRODUCTS` until Task 11 (cleanup) — every task before that must leave the app in a fully green, buildable, testable state, and several tasks rely on the old functions still existing while newer hooks are added alongside them.
- `.env.local` must never be committed. `SUPABASE_SERVICE_ROLE_KEY` (used only by the one-time seed script) must never be prefixed with `VITE_` and must never appear in Vercel's environment variables — it is a local-only secret with full database write access, bypassing RLS.

---

### Task 1: Supabase project setup (human checkpoint)

**Files:** none — this task has no code. It is executed by the controller (you) directly asking the human partner to do these steps, not by dispatching an implementer subagent. Nothing in this task can be automated: creating a third-party account and project is outside any subagent's reach.

**Interfaces:**
- Produces: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — three string values the human partner hands back, consumed by Task 2 (`.env.local`) and Task 3 (seed script).

- [ ] **Step 1: Ask the human partner to create the Supabase project and run this SQL**

Present these exact instructions in chat:

1. Go to https://supabase.com, sign up or log in, and create a new project (any name, e.g. "tee-closet"; choose a region close to Kenya, e.g. Europe or a nearby region if offered). Note the database password you set — it isn't needed again for this plan.
2. Once the project is ready, open the **SQL Editor** (left sidebar) and run this script exactly, in one go:

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

insert into storage.buckets (id, name, public) values ('product-photos', 'product-photos', true);

create policy "public read product photos" on storage.objects for select
  using (bucket_id = 'product-photos');

create policy "admin write product photos" on storage.objects for all
  using (bucket_id = 'product-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'product-photos' and auth.role() = 'authenticated');
```

3. Go to **Project Settings → API** and copy two values: the **Project URL** and the **anon / public key**.
4. On the same page, reveal and copy the **service_role** secret key too (needed only for a one-time local migration script — never used in the deployed site).
5. Send back all three values: Project URL, anon key, service_role key.

- [ ] **Step 2: Wait for the three values, then proceed to Task 2**

Do not proceed to any other task until all three values are in hand.

---

### Task 2: Dependencies, Supabase client, React Query provider, env files

**Files:**
- Modify: `site/package.json` (add `@supabase/supabase-js`, `@tanstack/react-query`)
- Create: `site/src/lib/supabaseClient.ts`
- Create: `site/src/test/queryWrapper.tsx`
- Modify: `site/src/main.tsx`
- Create: `site/.env.local` (gitignored, not committed — contains the real values from Task 1)
- Create: `site/.env.example` (committed — documents the required vars with placeholder values)
- Modify: `site/.gitignore`

**Interfaces:**
- Consumes: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` from Task 1.
- Produces: `supabase` (exported Supabase client instance) — consumed by every hook in Tasks 4, 5, and by the seed script in Task 3. `createTestQueryClient()` and `QueryWrapper` — consumed by every updated test file in Tasks 4–10.

- [ ] **Step 1: Install dependencies**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm install @supabase/supabase-js @tanstack/react-query`

- [ ] **Step 2: Create the Supabase client**

Create `site/src/lib/supabaseClient.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Create the test query-client wrapper**

Create `site/src/test/queryWrapper.tsx`:

```tsx
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

export function QueryWrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}
```

- [ ] **Step 4: Wrap the app in `QueryClientProvider`**

Modify `site/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { App } from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 5: Create env files**

Create `site/.env.local` (fill in the two real values from Task 1's Step 1):

```
VITE_SUPABASE_URL=<the Project URL from Task 1>
VITE_SUPABASE_ANON_KEY=<the anon key from Task 1>
```

Create `site/.env.example` (committed):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 6: Gitignore the local env file**

Modify `site/.gitignore` — add one line:

```
.env.local
```

- [ ] **Step 7: Verify the build still passes**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm run build`
Expected: PASS (nothing consumes `supabaseClient.ts` yet, so no runtime env-var check fires; the module isn't imported by any file yet, so `tsc -b` and `vite build` succeed unchanged).

- [ ] **Step 8: Commit**

```bash
git add site/package.json site/package-lock.json site/src/lib/supabaseClient.ts site/src/test/queryWrapper.tsx site/src/main.tsx site/.env.example site/.gitignore
git commit -m "feat: add Supabase client, React Query provider, and test query wrapper"
```

---

### Task 3: Seed script — migrate the current catalog into Supabase

**Files:**
- Create: `site/scripts/seed-supabase.ts`
- Modify: `site/package.json` (add `tsx` devDependency, add `"seed"` script)

**Interfaces:**
- Consumes: `VITE_SUPABASE_URL` (from `.env.local`, Task 2) and `SUPABASE_SERVICE_ROLE_KEY` (from the human partner's shell environment — not a file) as `process.env` values.
- Produces: rows in Supabase's `categories`, `products`, `product_images` tables, and files in the `product-photos` Storage bucket — consumed by every hook built in Tasks 4–5 as the actual data those hooks read.

This script is a one-time local migration tool, run once by hand — it is not part of the deployed app and is never imported by any site code.

- [ ] **Step 1: Install `tsx`**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm install -D tsx`

- [ ] **Step 2: Add the seed script**

Create `site/scripts/seed-supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment before running this script')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const CATEGORIES = [
  { slug: 'wide-leg', label: 'Wide-Leg Pants', sortOrder: 0 },
  { slug: 'blazers', label: 'Blazers', sortOrder: 1 },
  { slug: 'tops', label: 'Tops', sortOrder: 2 },
  { slug: 'official-pants', label: 'Official Pants', sortOrder: 3 },
  { slug: 'chinos', label: 'Chinos', sortOrder: 4 },
  { slug: 'palazzo', label: 'Palazzo Pants', sortOrder: 5 },
]

const IMAGE_FILES = [
  'wide-leg-1.jpg', 'wide-leg-2.jpg',
  'blazers-1.jpg', 'blazers-2.jpg',
  'tops-1.jpg', 'tops-2.jpg',
  'official-pants-1.jpg', 'official-pants-2.jpg',
  'chinos-1.jpg', 'chinos-2.jpg',
  'palazzo-1.jpg', 'palazzo-2.jpg',
]

const CATEGORY_IMAGES: Record<string, [string, string]> = {
  'wide-leg': ['wide-leg-1.jpg', 'wide-leg-2.jpg'],
  blazers: ['blazers-1.jpg', 'blazers-2.jpg'],
  tops: ['tops-1.jpg', 'tops-2.jpg'],
  'official-pants': ['official-pants-1.jpg', 'official-pants-2.jpg'],
  chinos: ['chinos-1.jpg', 'chinos-2.jpg'],
  palazzo: ['palazzo-1.jpg', 'palazzo-2.jpg'],
}

interface SeedProduct {
  slug: string
  name: string
  category: string
  priceKsh: number
  sizes: number[]
  colors: string[]
  availability: 'in-stock' | 'limited' | 'sold'
  isNew: boolean
  isFeatured: boolean
  description: string
  stylingNote: string
}

const PRODUCTS: SeedProduct[] = [
  { slug: 'camel-wide-leg-trousers', name: 'Camel Wide-Leg Trousers', category: 'wide-leg', priceKsh: 2800, sizes: [28, 30, 32, 34, 36], colors: ['Camel'], availability: 'in-stock', isNew: true, isFeatured: true, description: 'High-waisted wide-leg trousers in a soft camel drape that moves with you.', stylingNote: 'Pair with a fitted top and heels for the office, or sneakers for a relaxed weekend look.' },
  { slug: 'black-wide-leg-trousers', name: 'Black Wide-Leg Trousers', category: 'wide-leg', priceKsh: 2600, sizes: [26, 28, 30, 32, 34, 36, 38], colors: ['Black'], availability: 'in-stock', isNew: false, isFeatured: false, description: 'A closet staple — flowy black wide-legs that flatter every body shape.', stylingNote: 'Effortless with a crisp white shirt or a cropped blazer.' },
  { slug: 'rust-wide-leg-trousers', name: 'Rust Wide-Leg Trousers', category: 'wide-leg', priceKsh: 2700, sizes: [30, 32, 34], colors: ['Rust'], availability: 'limited', isNew: true, isFeatured: false, description: "A statement rust wide-leg in limited stock — once it's gone, it's gone.", stylingNote: 'Let the colour lead: keep the top simple in black or cream.' },
  { slug: 'sand-wide-leg-linen-trousers', name: 'Sand Wide-Leg Linen Trousers', category: 'wide-leg', priceKsh: 2900, sizes: [28, 30, 32, 34, 36, 38, 40], colors: ['Sand', 'White'], availability: 'in-stock', isNew: false, isFeatured: false, description: "Breathable linen-blend wide-legs in warm sand, built for Kenya's sunny days.", stylingNote: 'Style with a fitted tank and slides for an easy daytime look.' },
  { slug: 'espresso-tailored-blazer', name: 'Espresso Tailored Blazer', category: 'blazers', priceKsh: 3500, sizes: [30, 32, 34, 36, 38], colors: ['Espresso Black'], availability: 'in-stock', isNew: true, isFeatured: true, description: 'A sharply tailored espresso blazer that instantly elevates any outfit.', stylingNote: 'Wear open over a simple tee and jeans, or buttoned for the boardroom.' },
  { slug: 'camel-oversized-blazer', name: 'Camel Oversized Blazer', category: 'blazers', priceKsh: 3200, sizes: [28, 30, 32, 34, 36], colors: ['Camel'], availability: 'in-stock', isNew: false, isFeatured: true, description: 'An oversized camel blazer with clean lines for that quiet-luxury look.', stylingNote: 'Roll the sleeves and pair with wide-leg trousers for a full monochrome moment.' },
  { slug: 'pinstripe-power-blazer', name: 'Pinstripe Power Blazer', category: 'blazers', priceKsh: 3400, sizes: [32, 34, 36, 38, 40], colors: ['Charcoal Pinstripe'], availability: 'limited', isNew: true, isFeatured: false, description: 'A structured pinstripe blazer with serious boardroom presence — limited pieces only.', stylingNote: 'Layer over a champagne cami for evening, or a plain white shirt for the office.' },
  { slug: 'cream-linen-blazer', name: 'Cream Linen Blazer', category: 'blazers', priceKsh: 3100, sizes: [30, 32, 34, 36], colors: ['Cream'], availability: 'sold', isNew: false, isFeatured: false, description: 'A soft cream linen blazer — one of our most-loved one-off pieces.', stylingNote: 'Was styled beautifully over a black slip dress — check New Stock for the next drop.' },
  { slug: 'ivory-wrap-top', name: 'Ivory Wrap Top', category: 'tops', priceKsh: 1200, sizes: [26, 28, 30, 32, 34], colors: ['Ivory'], availability: 'in-stock', isNew: true, isFeatured: true, description: 'A soft ivory wrap top that ties at the waist for an adjustable, flattering fit.', stylingNote: 'Tuck into wide-legs or palazzo pants for a polished silhouette.' },
  { slug: 'champagne-satin-cami', name: 'Champagne Satin Cami', category: 'tops', priceKsh: 1400, sizes: [28, 30, 32, 34, 36], colors: ['Champagne'], availability: 'limited', isNew: true, isFeatured: false, description: 'A champagne satin cami with a subtle sheen, perfect under a blazer.', stylingNote: 'Dress up with the Espresso Tailored Blazer, or wear alone for evening.' },
  { slug: 'black-corset-top', name: 'Black Corset Top', category: 'tops', priceKsh: 1600, sizes: [26, 28, 30, 32, 34, 36], colors: ['Black'], availability: 'in-stock', isNew: false, isFeatured: true, description: 'A structured black corset top that cinches the waist and holds its shape.', stylingNote: 'Balance the fitted top with our flowy Cream Palazzo Pants.' },
  { slug: 'mocha-off-shoulder-top', name: 'Mocha Off-Shoulder Top', category: 'tops', priceKsh: 1300, sizes: [28, 30, 32, 34], colors: ['Mocha'], availability: 'in-stock', isNew: false, isFeatured: false, description: 'An off-shoulder top in warm mocha with a relaxed, breezy fit.', stylingNote: 'Perfect with denim or our Sand Chino Pants for a laid-back day out.' },
  { slug: 'charcoal-official-trousers', name: 'Charcoal Official Trousers', category: 'official-pants', priceKsh: 2400, sizes: [28, 30, 32, 34, 36, 38, 40], colors: ['Charcoal'], availability: 'in-stock', isNew: false, isFeatured: true, description: 'Sharp charcoal official trousers, tailored for the modern workweek.', stylingNote: 'Classic with a fitted blouse and low heels for the office.' },
  { slug: 'navy-official-trousers', name: 'Navy Official Trousers', category: 'official-pants', priceKsh: 2400, sizes: [30, 32, 34, 36, 38], colors: ['Navy'], availability: 'in-stock', isNew: false, isFeatured: false, description: 'Crisp navy official trousers with a clean, straight-leg cut.', stylingNote: 'Pairs effortlessly with white or ivory tops for a fresh, professional look.' },
  { slug: 'black-slim-official-trousers', name: 'Black Slim Official Trousers', category: 'official-pants', priceKsh: 2500, sizes: [26, 28, 30, 32, 34], colors: ['Black'], availability: 'limited', isNew: true, isFeatured: false, description: 'Slim-fit black official trousers, limited stock, tailored close to the body.', stylingNote: 'Wear with the Black Corset Top and a blazer for a sleek all-black look.' },
  { slug: 'sand-chino-pants', name: 'Sand Chino Pants', category: 'chinos', priceKsh: 2200, sizes: [28, 30, 32, 34, 36, 38], colors: ['Sand'], availability: 'in-stock', isNew: false, isFeatured: true, description: 'Everyday sand chinos with a comfortable straight fit.', stylingNote: 'An easy pairing with any of our tops — the definition of Tee Closet versatile.' },
  { slug: 'olive-chino-pants', name: 'Olive Chino Pants', category: 'chinos', priceKsh: 2200, sizes: [30, 32, 34, 36], colors: ['Olive'], availability: 'in-stock', isNew: true, isFeatured: false, description: 'Olive chinos with a modern tapered leg — new stock just in.', stylingNote: 'Style with the Mocha Off-Shoulder Top for a soft, earthy palette.' },
  { slug: 'taupe-straight-chinos', name: 'Taupe Straight Chinos', category: 'chinos', priceKsh: 2300, sizes: [28, 30, 32, 34, 36, 38, 40], colors: ['Taupe'], availability: 'in-stock', isNew: false, isFeatured: false, description: 'Straight-leg taupe chinos — smart enough for work, relaxed enough for weekends.', stylingNote: 'Roll the hem and wear with loafers for a polished off-duty look.' },
  { slug: 'cream-flowy-palazzo-pants', name: 'Cream Flowy Palazzo Pants', category: 'palazzo', priceKsh: 2600, sizes: [28, 30, 32, 34, 36], colors: ['Cream'], availability: 'in-stock', isNew: true, isFeatured: true, description: 'Flowy cream palazzo pants that move beautifully with every step.', stylingNote: 'Pair with the Black Corset Top for contrast, or keep it tonal with ivory.' },
  { slug: 'rust-printed-palazzo-pants', name: 'Rust Printed Palazzo Pants', category: 'palazzo', priceKsh: 2700, sizes: [30, 32, 34, 36, 38], colors: ['Rust Print'], availability: 'limited', isNew: true, isFeatured: false, description: 'Statement printed palazzo pants in warm rust tones — a limited run.', stylingNote: 'Let the print be the star — style with a plain black or ivory top.' },
]

async function uploadImages(): Promise<Record<string, string>> {
  const urls: Record<string, string> = {}
  for (const file of IMAGE_FILES) {
    const filePath = resolve(__dirname, '../public/products', file)
    const buffer = readFileSync(filePath)
    const storagePath = `seed/${file}`
    const { error } = await supabase.storage
      .from('product-photos')
      .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('product-photos').getPublicUrl(storagePath)
    urls[file] = data.publicUrl
    console.log(`Uploaded ${file}`)
  }
  return urls
}

async function seed() {
  const imageUrls = await uploadImages()

  console.log('Inserting categories...')
  const { error: catError } = await supabase
    .from('categories')
    .upsert(
      CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, sort_order: c.sortOrder })),
      { onConflict: 'slug' },
    )
  if (catError) throw catError

  for (const product of PRODUCTS) {
    console.log(`Seeding ${product.slug}...`)
    const { data: inserted, error: prodError } = await supabase
      .from('products')
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          category: product.category,
          price_ksh: product.priceKsh,
          sizes: product.sizes,
          colors: product.colors,
          availability: product.availability,
          is_new: product.isNew,
          is_featured: product.isFeatured,
          description: product.description,
          styling_note: product.stylingNote,
        },
        { onConflict: 'slug' },
      )
      .select()
      .single()
    if (prodError) throw prodError

    const [img1, img2] = CATEGORY_IMAGES[product.category]
    await supabase.from('product_images').delete().eq('product_id', inserted.id)
    const { error: imgError } = await supabase.from('product_images').insert([
      { product_id: inserted.id, url: imageUrls[img1], sort_order: 0 },
      { product_id: inserted.id, url: imageUrls[img2], sort_order: 1 },
    ])
    if (imgError) throw imgError
  }

  console.log(`Done. Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 3: Add the npm script**

Modify `site/package.json` — add to `"scripts"`:

```json
"seed": "tsx scripts/seed-supabase.ts"
```

- [ ] **Step 4: Run the seed script**

Run (the service role key comes from Task 1's Step 5, set only in this shell session, never written to a file):

```bash
export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH"
cd site
export VITE_SUPABASE_URL="<the value from site/.env.local>"
export SUPABASE_SERVICE_ROLE_KEY="<the service role key from Task 1>"
npm run seed
```

Expected: console logs for each of the 12 image uploads, then each of the 20 products, ending with `Done. Seeded 6 categories and 20 products.`

- [ ] **Step 5: Verify in the Supabase dashboard**

Open the Supabase project's **Table Editor**. Confirm `categories` has 6 rows, `products` has 20 rows, `product_images` has 40 rows (2 per product). Open **Storage → product-photos → seed** and confirm 12 files are present.

- [ ] **Step 6: Commit**

```bash
git add site/scripts/seed-supabase.ts site/package.json site/package-lock.json
git commit -m "feat: add one-time Supabase seed script and migrate the current catalog"
```

---

### Task 4: Categories data layer — hook, pure label function, and all consumers

**Files:**
- Modify: `site/src/data/types.ts`
- Modify: `site/src/data/categories.ts`
- Modify: `site/src/data/categories.test.ts` (find the current test file for `categories.ts` first — check `site/src/data/` for its exact name)
- Modify: `site/src/components/product/ProductCard.tsx`
- Modify: `site/src/components/product/ProductCard.test.tsx`
- Modify: `site/src/routes/ProductDetail.tsx` (category-label line only — the rest of this file's data fetching is untouched until Task 9)
- Modify: `site/src/routes/ProductDetail.test.tsx`
- Modify: `site/src/components/shop/FilterPanel.tsx`
- Modify: `site/src/components/shop/FilterPanel.test.tsx`
- Modify: `site/src/components/home/CategoryGrid.tsx` (category-list line only — the cover-image line still uses the old synchronous `getProducts` until Task 7)
- Modify: `site/src/components/home/CategoryGrid.test.tsx`
- Modify: `site/src/routes/Shop.tsx` (type import only — `Category` → `CategorySlug`)

**Interfaces:**
- Produces: `CategorySlug` (type alias for `string`, replaces the old `Category` union type everywhere a category slug is used), `Category` (new interface: `{ id: string; slug: string; label: string; sortOrder: number }`, the DB row shape), `useCategories()` (React Query hook returning `{ data: Category[] | undefined, isLoading, isError }`), `getCategoryLabel(categories: Category[], slug: string): string` (pure function, no longer reads a module-level array).
- Removes: the old `Category` union type, `CategoryMeta` interface, `CATEGORIES` array, and the old single-argument `getCategoryLabel(slug: string)`.
- Consumes (unchanged): nothing new — this task only touches categories.

This task changes one exported function's signature and one type's meaning across 4 real consumer files. Every step below is mechanical (rename a type, add a hook call, change one function call's arguments) — no design judgment required.

- [ ] **Step 1: Update `types.ts`**

Modify `site/src/data/types.ts` — replace the `Category` union type and update every reference to it:

```ts
export type CategorySlug = string

export interface Category {
  id: string
  slug: string
  label: string
  sortOrder: number
}

export type Size = 26 | 28 | 30 | 32 | 34 | 36 | 38 | 40

export type Availability = 'in-stock' | 'limited' | 'sold'

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  priceKsh: number
  sizes: Size[]
  colors: string[]
  availability: Availability
  isNew: boolean
  isFeatured: boolean
  description: string
  stylingNote: string
  images: string[]
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular'

export interface ProductFilters {
  category?: CategorySlug
  size?: Size
  availability?: Availability
  sort?: SortOption
}
```

- [ ] **Step 2: Rewrite `categories.ts`**

Replace the full contents of `site/src/data/categories.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Category } from './types'

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, label, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    sortOrder: row.sort_order,
  }))
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function getCategoryLabel(categories: Category[], slug: string): string {
  return categories.find((c) => c.slug === slug)?.label ?? slug
}
```

- [ ] **Step 3: Write the categories tests**

Find the current test file for `categories.ts` (likely `site/src/data/categories.test.ts`) and replace its contents:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { useCategories, getCategoryLabel } from './categories'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

describe('useCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches and maps categories ordered by sort_order', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: '1', slug: 'blazers', label: 'Blazers', sort_order: 1 }],
      error: null,
    })
    const select = vi.fn().mockReturnValue({ order })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useCategories(), { wrapper: QueryWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: '1', slug: 'blazers', label: 'Blazers', sortOrder: 1 }])
    expect(supabase.from).toHaveBeenCalledWith('categories')
  })
})

describe('getCategoryLabel', () => {
  it('returns the matching label', () => {
    const categories = [{ id: '1', slug: 'blazers', label: 'Blazers', sortOrder: 1 }]
    expect(getCategoryLabel(categories, 'blazers')).toBe('Blazers')
  })

  it('falls back to the slug when not found', () => {
    expect(getCategoryLabel([], 'unknown')).toBe('unknown')
  })
})
```

- [ ] **Step 4: Fix `ProductCard.tsx`**

Modify `site/src/components/product/ProductCard.tsx` — replace the import and the label line:

```tsx
import { useCategories, getCategoryLabel } from '@/data/categories'
```

(remove the old `import { getCategoryLabel } from '@/data/categories'` line it replaces)

Inside the component body, add:

```tsx
export function ProductCard({ product }: { product: Product }) {
  const { data: categories } = useCategories()
  const productUrl = ...
```

And change the label line from `{getCategoryLabel(product.category)}` to `{getCategoryLabel(categories ?? [], product.category)}`.

- [ ] **Step 5: Fix `ProductCard.test.tsx`**

Wrap every `render(<ProductCard ... />)` call in `site/src/components/product/ProductCard.test.tsx` with the query wrapper: change `render(<ProductCard product={product} />)` to `render(<ProductCard product={product} />, { wrapper: QueryWrapper })`, and add `import { QueryWrapper } from '@/test/queryWrapper'` at the top. Mock `@/lib/supabaseClient` at the top of the file the same way as Step 3, returning a `categories` select chain resolving to `[]` (or the categories the specific test needs) via `supabase.from` — if a test asserts on the category label text, mock it to resolve with the matching row and change the assertion to `await screen.findByText(...)` instead of `screen.getByText(...)`.

- [ ] **Step 6: Fix `ProductDetail.tsx`'s category label line only**

Modify `site/src/routes/ProductDetail.tsx` — add the import and hook call, and change the label line. Do not touch `getProductBySlug`/`getRelatedProducts` in this task (Task 9 handles those):

```tsx
import { useCategories, getCategoryLabel } from '@/data/categories'
```

```tsx
export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? getProductBySlug(slug) : undefined
  const { data: categories } = useCategories()
  const [selectedSize, setSelectedSize] = useState<Size | undefined>()
```

Change `{getCategoryLabel(product.category)}` to `{getCategoryLabel(categories ?? [], product.category)}`.

- [ ] **Step 7: Fix `ProductDetail.test.tsx`**

Same pattern as Step 5: wrap renders with `QueryWrapper`, mock `@/lib/supabaseClient`'s `categories` select chain, use `findByText` for the category label assertion if one exists.

- [ ] **Step 8: Fix `FilterPanel.tsx`**

Modify `site/src/components/shop/FilterPanel.tsx` — replace the `CATEGORIES` import and usage:

```tsx
import { useCategories } from '@/data/categories'
```

(remove `import { CATEGORIES } from '@/data/categories'`)

```tsx
export function FilterPanel({ filters, onChange, isOpen, onClose }: FilterPanelProps) {
  const { data: categories } = useCategories()
  return (
```

Change `{CATEGORIES.map((category) => (` to `{(categories ?? []).map((category) => (`.

- [ ] **Step 9: Fix `FilterPanel.test.tsx`**

Same pattern: wrap renders with `QueryWrapper`, mock `@/lib/supabaseClient`, resolve categories with a fixed test list, use `findBy*` where the category list renders.

- [ ] **Step 10: Fix `CategoryGrid.tsx`'s category-list line only**

Modify `site/src/components/home/CategoryGrid.tsx` — replace the `CATEGORIES` import and the list source, leaving `getProducts` untouched:

```tsx
import { useCategories } from '@/data/categories'
import { getProducts } from '@/data/products'
```

```tsx
export function CategoryGrid() {
  const { data: categories } = useCategories()
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {(categories ?? []).map((category) => {
          const cover = getProducts({ category: category.slug })[0]?.images[0]
```

(the rest of the component body is unchanged)

- [ ] **Step 11: Fix `CategoryGrid.test.tsx`**

Same pattern: wrap renders with `QueryWrapper`, mock `@/lib/supabaseClient`'s categories chain, use `findBy*` for category labels/links.

- [ ] **Step 12: Fix `Shop.tsx`'s type import**

Modify `site/src/routes/Shop.tsx` — change the import and the one cast:

```tsx
import type { CategorySlug, ProductFilters, Size, SortOption } from '@/data/types'
```

```tsx
const category = params.get('category') as CategorySlug | null
```

- [ ] **Step 13: Run the full test suite and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS. If any other file references the old `Category` type (search with a grep for `from '@/data/types'` importing `Category` before running — fix any missed import to `CategorySlug`).

- [ ] **Step 14: Commit**

```bash
git add site/src/data/types.ts site/src/data/categories.ts site/src/data/categories.test.ts site/src/components/product/ProductCard.tsx site/src/components/product/ProductCard.test.tsx site/src/routes/ProductDetail.tsx site/src/routes/ProductDetail.test.tsx site/src/components/shop/FilterPanel.tsx site/src/components/shop/FilterPanel.test.tsx site/src/components/home/CategoryGrid.tsx site/src/components/home/CategoryGrid.test.tsx site/src/routes/Shop.tsx
git commit -m "feat: migrate categories to a Supabase-backed React Query hook"
```

---

### Task 5: Products data layer — add new hooks alongside the old functions

**Files:**
- Modify: `site/src/data/products.ts` (add new exports; do not remove `PRODUCTS`, `getProducts`, `getProductBySlug`, `getRelatedProducts`)
- Modify: `site/src/data/products.test.ts` (add new test cases for the new hooks; keep the existing ones for the old functions)

**Interfaces:**
- Produces: `useProducts(filters?: ProductFilters)`, `useProductBySlug(slug: string | undefined)`, `useProductsBySlugs(slugs: string[])`, `useRelatedProducts(product: Product | null | undefined, limit?: number)` — all React Query hooks returning `{ data, isLoading, isError }` (except `useRelatedProducts`, which returns the same shape via `select`). Consumed by Tasks 6–10.
- Consumes: `supabase` from `@/lib/supabaseClient` (Task 2), `Category`/`CategorySlug`/`Product`/`ProductFilters`/`Size` from `@/data/types` (Task 4).

- [ ] **Step 1: Add the new hooks to `products.ts`**

Modify `site/src/data/products.ts` — keep every existing line (`PRODUCTS`, `getProducts`, `getProductBySlug`, `getRelatedProducts`) exactly as-is, and append this new code at the end of the file:

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

interface ProductRow {
  id: string
  slug: string
  name: string
  category: string
  price_ksh: number
  sizes: number[]
  colors: string[]
  availability: string
  is_new: boolean
  is_featured: boolean
  description: string
  styling_note: string
  product_images: { url: string; sort_order: number }[]
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    priceKsh: row.price_ksh,
    sizes: row.sizes as Product['sizes'],
    colors: row.colors,
    availability: row.availability as Product['availability'],
    isNew: row.is_new,
    isFeatured: row.is_featured,
    description: row.description,
    stylingNote: row.styling_note,
    images: [...row.product_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url),
  }
}

const PRODUCT_SELECT = `
  id, slug, name, category, price_ksh, sizes, colors, availability, is_new, is_featured, description, styling_note,
  product_images ( url, sort_order )
`

function sortProducts(results: Product[], sort: ProductFilters['sort']): Product[] {
  const sorted = [...results]
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.priceKsh - b.priceKsh)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.priceKsh - a.priceKsh)
      break
    case 'popular':
      sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
      break
    case 'newest':
    default:
      sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew))
      break
  }
  return sorted
}

async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase.from('products').select(PRODUCT_SELECT)

  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.size) {
    query = query.contains('sizes', [filters.size])
  }
  if (filters.availability) {
    query = query.eq('availability', filters.availability)
  }

  const { data, error } = await query
  if (error) throw error

  return sortProducts((data as unknown as ProductRow[]).map(mapRow), filters.sort)
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  })
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data ? mapRow(data as unknown as ProductRow) : null
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  })
}

async function fetchProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return []
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('slug', slugs)

  if (error) throw error
  return (data as unknown as ProductRow[]).map(mapRow)
}

export function useProductsBySlugs(slugs: string[]) {
  return useQuery({
    queryKey: ['products-by-slugs', [...slugs].sort()],
    queryFn: () => fetchProductsBySlugs(slugs),
    enabled: slugs.length > 0,
  })
}

export function useRelatedProducts(product: Product | null | undefined, limit = 4) {
  return useQuery({
    queryKey: ['related-products', product?.category, product?.id],
    queryFn: () => fetchProducts({ category: product!.category }),
    enabled: !!product,
    select: (data) => data.filter((p) => p.id !== product!.id).slice(0, limit),
  })
}
```

Add `import type { Product, ProductFilters } from './types'` at the top only if not already present (it already is, from the existing file's first line — do not duplicate the import).

- [ ] **Step 2: Add tests for the new hooks**

Append to `site/src/data/products.test.ts` (add the mock and imports at the top of the file if not already present from other tests in this file — check first):

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { useProducts, useProductBySlug, useProductsBySlugs, useRelatedProducts } from './products'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

const ROW = {
  id: '1',
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
  product_images: [
    { url: '/b2.jpg', sort_order: 1 },
    { url: '/b1.jpg', sort_order: 0 },
  ],
}

describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('applies category, size, and availability filters and maps rows', async () => {
    const eq = vi.fn().mockReturnThis()
    const contains = vi.fn().mockReturnThis()
    const chain = { eq, contains, then: undefined }
    const select = vi.fn().mockReturnValue(
      Object.assign(Promise.resolve({ data: [ROW], error: null }), chain),
    )
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(
      () => useProducts({ category: 'blazers', size: 32, availability: 'in-stock' }),
      { wrapper: QueryWrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data![0].images).toEqual(['/b1.jpg', '/b2.jpg'])
    expect(result.current.data![0].category).toBe('blazers')
  })
})

describe('useProductBySlug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches a single product by slug', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: ROW, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductBySlug('espresso-tailored-blazer'), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.slug).toBe('espresso-tailored-blazer')
  })

  it('does not query when slug is undefined', () => {
    const select = vi.fn()
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    renderHook(() => useProductBySlug(undefined), { wrapper: QueryWrapper })

    expect(select).not.toHaveBeenCalled()
  })
})

describe('useProductsBySlugs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches multiple products by an array of slugs', async () => {
    const inFn = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const select = vi.fn().mockReturnValue({ in: inFn })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const { result } = renderHook(() => useProductsBySlugs(['espresso-tailored-blazer']), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(inFn).toHaveBeenCalledWith('slug', ['espresso-tailored-blazer'])
  })
})

describe('useRelatedProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('excludes the current product and limits results', async () => {
    const secondRow = { ...ROW, id: '2', slug: 'camel-oversized-blazer' }
    const eq = vi.fn().mockResolvedValue({ data: [ROW, secondRow], error: null })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })

    const currentProduct = { ...ROW, id: '1', priceKsh: 3500 } as never

    const { result } = renderHook(() => useRelatedProducts(currentProduct, 4), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.map((p) => p.id)).toEqual(['2'])
  })
})
```

- [ ] **Step 3: Run tests and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS — the existing `getProducts`/`getProductBySlug`/`getRelatedProducts` tests still pass unchanged, and the new hook tests pass.

- [ ] **Step 4: Commit**

```bash
git add site/src/data/products.ts site/src/data/products.test.ts
git commit -m "feat: add Supabase-backed product hooks alongside the existing sync functions"
```

---

### Task 6: Migrate `NewStockStrip` and `FeaturedGrid` to `useProducts`

**Files:**
- Modify: `site/src/components/home/NewStockStrip.tsx`
- Modify: `site/src/components/home/NewStockStrip.test.tsx`
- Modify: `site/src/components/home/FeaturedGrid.tsx`
- Modify: `site/src/components/home/FeaturedGrid.test.tsx`

**Interfaces:**
- Consumes: `useProducts` from `@/data/products` (Task 5), `Skeleton` from `@/components/ui/Skeleton` (existing, unused until now).

Both components share the same shape: fetch, filter client-side, render a skeleton while loading, render nothing (as today) when the filtered result is empty.

- [ ] **Step 1: Migrate `NewStockStrip.tsx`**

Replace the full contents of `site/src/components/home/NewStockStrip.tsx`:

```tsx
import { useProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function NewStockStrip() {
  const { data, isLoading } = useProducts({ sort: 'newest' })
  const products = (data ?? []).filter((p) => p.isNew).slice(0, 8)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl text-espresso">New Stock</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-44 flex-shrink-0 md:w-56" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">New Stock</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-44 flex-shrink-0 md:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Migrate `FeaturedGrid.tsx`**

Replace the full contents of `site/src/components/home/FeaturedGrid.tsx`:

```tsx
import { useProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function FeaturedGrid() {
  const { data, isLoading } = useProducts({ sort: 'popular' })
  const products = (data ?? []).filter((p) => p.isFeatured).slice(0, 8)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl text-espresso">Featured Picks</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Featured Picks</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Update both test files**

In `site/src/components/home/NewStockStrip.test.tsx` and `site/src/components/home/FeaturedGrid.test.tsx`: add `import { QueryWrapper } from '@/test/queryWrapper'` and mock `@/lib/supabaseClient` (`vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))`), returning a `select` chain that resolves `{ data: [...testRows], error: null }` matching each test's expected products (use the `ProductRow` shape from Task 5 — remember `product_images` is an array of `{ url, sort_order }`, and `category` is a plain string). Wrap every `render(...)` call with `{ wrapper: QueryWrapper }` and change synchronous `getByText`/`getByRole` assertions on product data to `findByText`/`findByRole`. Also mock `ProductCard`'s internal `useCategories()` dependency the same way (empty `categories` select chain resolving to `{ data: [], error: null }` is enough since these tests don't assert on category labels).

- [ ] **Step 4: Run tests**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add site/src/components/home/NewStockStrip.tsx site/src/components/home/NewStockStrip.test.tsx site/src/components/home/FeaturedGrid.tsx site/src/components/home/FeaturedGrid.test.tsx
git commit -m "feat: migrate NewStockStrip and FeaturedGrid to useProducts"
```

---

### Task 7: Migrate `CategoryGrid`'s cover images to `useProducts`

**Files:**
- Modify: `site/src/components/home/CategoryGrid.tsx`
- Modify: `site/src/components/home/CategoryGrid.test.tsx`

**Interfaces:**
- Consumes: `useProducts` from `@/data/products` (Task 5). Category list already comes from `useCategories` (Task 4) — unchanged in this task.

Calling a hook once per category inside a `.map()` loop would violate the rules of hooks. Instead, fetch all products once (unfiltered) and derive each category's cover image client-side.

- [ ] **Step 1: Migrate the cover-image logic**

Replace the full contents of `site/src/components/home/CategoryGrid.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { useCategories } from '@/data/categories'
import { useProducts } from '@/data/products'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Skeleton } from '@/components/ui/Skeleton'

export function CategoryGrid() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: products, isLoading: productsLoading } = useProducts()

  const coverByCategory = new Map<string, string>()
  for (const product of products ?? []) {
    if (!coverByCategory.has(product.category) && product.images[0]) {
      coverByCategory.set(product.category, product.images[0])
    }
  }

  const isLoading = categoriesLoading || productsLoading

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))
          : (categories ?? []).map((category) => {
              const cover = coverByCategory.get(category.slug)
              return (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-sand/40"
                >
                  {cover && (
                    <ImageWithFallback
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-espresso/70 px-3 py-2 text-sm font-medium text-ivory">
                    {category.label}
                  </span>
                </Link>
              )
            })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `CategoryGrid.test.tsx`**

Extend the existing mock of `@/lib/supabaseClient` (added in Task 4) to also handle `supabase.from('products')`, returning a `select` chain resolving `{ data: [...testProductRows], error: null }`. Change any assertion on the cover image `src` from synchronous to `findByRole('img')`/`waitFor`.

- [ ] **Step 3: Run tests**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/home/CategoryGrid.tsx site/src/components/home/CategoryGrid.test.tsx
git commit -m "feat: migrate CategoryGrid cover images to useProducts"
```

---

### Task 8: Migrate `Shop.tsx` to `useProducts`

**Files:**
- Modify: `site/src/routes/Shop.tsx`
- Modify: `site/src/routes/Shop.test.tsx`

**Interfaces:**
- Consumes: `useProducts` from `@/data/products` (Task 5), existing `EmptyState`, `Skeleton`.

- [ ] **Step 1: Migrate the data fetch and add loading/error states**

Modify `site/src/routes/Shop.tsx` — change the import and the data line, and the rendering below it:

```tsx
import { useProducts } from '@/data/products'
```

(remove `import { getProducts } from '@/data/products'`)

```tsx
export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setFilterOpen] = useState(false)
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const { data: products, isLoading, isError } = useProducts(filters)
  const count = products?.length ?? 0

  const updateFilters = (next: ProductFilters) => setSearchParams(toSearchParams(next))
  const removeFilter = (key: keyof ProductFilters) => updateFilters({ ...filters, [key]: undefined })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Seo
        title="Shop All"
        description="Browse Tee Closet's full catalogue — wide-leg pants, blazers, tops, official pants, chinos and palazzo pants. Filter by size, category and availability."
      />
      <h1 className="font-display text-3xl text-espresso">Shop All</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {isLoading ? 'Loading…' : `${count} piece${count === 1 ? '' : 's'}`}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4 md:hidden">
        <Button variant="ghost" onClick={() => setFilterOpen(true)}>
          Filters
        </Button>
        <SortSelect value={filters.sort ?? 'newest'} onChange={(sort) => updateFilters({ ...filters, sort })} />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[14rem_1fr]">
        <FilterPanel
          filters={filters}
          onChange={updateFilters}
          isOpen={isFilterOpen}
          onClose={() => setFilterOpen(false)}
        />

        <div>
          <div className="hidden items-center justify-between md:flex">
            <ActiveFilterChips filters={filters} onRemove={removeFilter} />
            <SortSelect value={filters.sort ?? 'newest'} onChange={(sort) => updateFilters({ ...filters, sort })} />
          </div>

          <div className="mt-4 md:hidden">
            <ActiveFilterChips filters={filters} onRemove={removeFilter} />
          </div>

          {isLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Couldn't load products"
              description="Something went wrong loading the catalogue. Please try again shortly."
            />
          ) : count === 0 ? (
            <EmptyState
              title="No pieces match those filters"
              description="Try clearing a filter or check back — new stock drops regularly."
              action={
                <Button variant="ghost" onClick={() => updateFilters({})}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products!.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

Add `import { Skeleton } from '@/components/ui/Skeleton'` at the top.

- [ ] **Step 2: Update `Shop.test.tsx`**

Add `import { QueryWrapper } from '@/test/queryWrapper'` and mock `@/lib/supabaseClient`'s `products` select chain (and `categories`, since `FilterPanel` and `ProductCard` inside `Shop` both call `useCategories`). Wrap every render with `{ wrapper: QueryWrapper }`. Change synchronous product-list assertions to `findByText`/`waitFor`. Add one new test asserting the loading skeleton renders before data resolves (query the mock to never resolve within the test, or check for `role="status"` elements immediately after render, before `await`).

- [ ] **Step 3: Run tests**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/routes/Shop.tsx site/src/routes/Shop.test.tsx
git commit -m "feat: migrate Shop to useProducts with loading and error states"
```

---

### Task 9: Migrate `ProductDetail.tsx`'s remaining data calls to hooks

**Files:**
- Modify: `site/src/routes/ProductDetail.tsx`
- Modify: `site/src/routes/ProductDetail.test.tsx`

**Interfaces:**
- Consumes: `useProductBySlug`, `useRelatedProducts` from `@/data/products` (Task 5). `useCategories`/`getCategoryLabel` already wired in Task 4.

- [ ] **Step 1: Migrate the remaining data fetch**

Replace the full contents of `site/src/routes/ProductDetail.tsx`:

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProductBySlug, useRelatedProducts } from '@/data/products'
import { useCategories, getCategoryLabel } from '@/data/categories'
import { formatKsh } from '@/lib/format'
import { buildWhatsAppOrderLink } from '@/lib/whatsapp'
import type { Size } from '@/data/types'
import { ProductGallery } from '@/components/product/ProductGallery'
import { SizePicker } from '@/components/product/SizePicker'
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ProductCard } from '@/components/product/ProductCard'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { Seo } from '@/components/seo/Seo'
import { NotFound } from './NotFound'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProductBySlug(slug)
  const { data: categories } = useCategories()
  const { data: related } = useRelatedProducts(product)
  const [selectedSize, setSelectedSize] = useState<Size | undefined>()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) return <NotFound />

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `/product/${product.slug}`
  const whatsAppLink = buildWhatsAppOrderLink(product, pageUrl, selectedSize)
  const isOrderable = product.availability !== 'sold'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Seo
        title={product.name}
        description={product.description}
        image={product.images[0]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'KES',
            price: product.priceKsh,
            availability:
              product.availability === 'in-stock'
                ? 'https://schema.org/InStock'
                : product.availability === 'limited'
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/SoldOut',
          },
        }}
      />
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-xs uppercase tracking-wider text-fg-muted">
            {getCategoryLabel(categories ?? [], product.category)}
          </p>
          <h1 className="mt-1 font-display text-3xl text-espresso">{product.name}</h1>
          <p className="mt-2 text-xl font-semibold text-espresso">{formatKsh(product.priceKsh)}</p>

          <div className="mt-3 flex items-center gap-3">
            <AvailabilityBadge availability={product.availability} />
            <WishlistButton productId={product.id} />
          </div>

          <p className="mt-6 text-fg-muted">{product.description}</p>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Size</p>
            <div className="mt-2">
              <SizePicker sizes={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-sand bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">How to wear it</p>
            <p className="mt-1 text-sm text-espresso">{product.stylingNote}</p>
          </div>

          {isOrderable ? (
            <>
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName('primary', 'mt-6 w-full')}
              >
                Order on WhatsApp
              </a>
              <AddToCartButton product={product} variant="inline" selectedSize={selectedSize} />
            </>
          ) : (
            <Button className="mt-6 w-full" disabled>
              Sold Out
            </Button>
          )}

          <button
            type="button"
            onClick={() => navigator.share?.({ title: product.name, url: pageUrl })}
            className="mt-3 text-sm text-espresso underline"
          >
            Share this piece
          </button>

          <p className="mt-6 text-xs text-fg-muted">
            Sizes run true to Tee Closet's chart (26–40). Message us on WhatsApp before ordering if you're
            unsure of your fit — we're happy to help.
          </p>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-espresso">You Might Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update `ProductDetail.test.tsx`**

Extend the mock added in Task 4 to also handle `supabase.from('products')` for both the `eq(...).maybeSingle()` chain (single-product fetch) and the `eq(...)` chain (related-products fetch). Change any remaining synchronous product assertions to `findBy*`/`waitFor`. Add a test asserting `<NotFound />` renders when the slug doesn't match any product (mock `maybeSingle` to resolve `{ data: null, error: null }`).

- [ ] **Step 3: Run tests**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/routes/ProductDetail.tsx site/src/routes/ProductDetail.test.tsx
git commit -m "feat: migrate ProductDetail to useProductBySlug and useRelatedProducts"
```

---

### Task 10: Migrate `CartDrawer.tsx` to `useProductsBySlugs`

**Files:**
- Modify: `site/src/components/cart/CartDrawer.tsx`
- Modify: `site/src/components/cart/CartDrawer.test.tsx`

**Interfaces:**
- Consumes: `useProductsBySlugs` from `@/data/products` (Task 5).

Calling `getProductBySlug` once per cart line inside a `.map()` today is synchronous and safe; calling a hook per line would violate the rules of hooks, so this resolves every line's product in one batched query.

- [ ] **Step 1: Migrate the product resolution**

Modify `site/src/components/cart/CartDrawer.tsx` — replace the import and the `lines` derivation:

```tsx
import { useProductsBySlugs } from '@/data/products'
```

(remove `import { getProductBySlug } from '@/data/products'`)

```tsx
export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const { data: cartProducts, isLoading } = useProductsBySlugs(items.map((item) => item.productSlug))
  const productBySlug = new Map((cartProducts ?? []).map((p) => [p.slug, p]))

  const lines = items
    .map((item) => {
      const product = productBySlug.get(item.productSlug)
      return product ? { ...item, product } : null
    })
    .filter((line): line is NonNullable<typeof line> => line !== null)
```

Add a loading branch right after the `lines`/`total`/`whatsAppLink` derivation, before the JSX that renders the empty-state/list — replace the ternary at `{lines.length === 0 ? (` with a three-way branch:

```tsx
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && items.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={`${item.productSlug}-${item.size}`} className="flex gap-3">
                  <Skeleton className="h-20 w-16 flex-shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </li>
              ))}
            </ul>
          ) : lines.length === 0 ? (
            <EmptyState title="Your cart is empty" description="Add pieces from the shop to build your order." />
          ) : (
```

(the rest of that `<ul>` block and the closing `)}` are unchanged)

Also guard the footer total block, which currently reads `{lines.length > 0 && (`, so it doesn't show a stale/zero total while loading — change to `{!isLoading && lines.length > 0 && (`.

Add `import { Skeleton } from '@/components/ui/Skeleton'` at the top.

- [ ] **Step 2: Update `CartDrawer.test.tsx`**

Add `import { QueryWrapper } from '@/test/queryWrapper'` and mock `@/lib/supabaseClient`'s `products` `.in()` chain, resolving with the row(s) matching each test's `useCartStore.setState({ items: [...] })` call (use the `ROW`-shaped object from Task 5's tests, with `slug: 'espresso-tailored-blazer'`, `price_ksh: 3500`, etc.). Wrap every `render(<CartDrawer />)` with `{ wrapper: QueryWrapper }`. Change synchronous line/total assertions to `findByText`/`waitFor`.

- [ ] **Step 3: Run tests**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add site/src/components/cart/CartDrawer.tsx site/src/components/cart/CartDrawer.test.tsx
git commit -m "feat: migrate CartDrawer to useProductsBySlugs"
```

---

### Task 11: Cleanup — delete the old synchronous product functions

**Files:**
- Modify: `site/src/data/products.ts` (delete `PRODUCTS`, `getProducts`, `getProductBySlug`, `getRelatedProducts`, and their now-unused `*_IMAGES` constants)
- Modify: `site/src/data/products.test.ts` (delete the test cases for the removed functions; keep the Task 5 hook tests)

**Interfaces:**
- Removes: `PRODUCTS`, `getProducts`, `getProductBySlug`, `getRelatedProducts` — verified in Step 1 to have zero remaining references anywhere in `site/src`.

- [ ] **Step 1: Confirm nothing still references the old functions**

Run (from the `site` directory): search for any remaining import of the old names outside `products.ts` itself:

```bash
grep -rn "getProducts\|getProductBySlug\|getRelatedProducts" site/src --include="*.tsx" --include="*.ts" | grep -v "site/src/data/products.ts" | grep -v "site/src/data/products.test.ts"
```

Expected: no output. If anything appears, that consumer was missed in Tasks 6–10 — fix it before continuing (migrate it to the corresponding hook using the same pattern as those tasks).

- [ ] **Step 2: Delete the old code**

Modify `site/src/data/products.ts` — remove the `WIDE_LEG_IMAGES` / `BLAZER_IMAGES` / `TOP_IMAGES` / `OFFICIAL_PANTS_IMAGES` / `CHINO_IMAGES` / `PALAZZO_IMAGES` constants, the `PRODUCTS` array, and the `getProducts`/`getProductBySlug`/`getRelatedProducts` functions in their entirety. The file should now start directly with the `import { useQuery } from '@tanstack/react-query'` block added in Task 5 (move that import, and the `import type { Product, ProductFilters } from './types'` line, to the top of the file if they aren't already there).

- [ ] **Step 3: Delete the corresponding old tests**

Modify `site/src/data/products.test.ts` — remove every `describe`/`it` block that tests `getProducts`, `getProductBySlug`, or `getRelatedProducts`. Keep the `useProducts`/`useProductBySlug`/`useProductsBySlugs`/`useRelatedProducts` blocks from Task 5.

- [ ] **Step 4: Run the full test suite and build**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS with zero TypeScript errors — this is the strongest signal that every consumer was correctly migrated.

- [ ] **Step 5: Commit**

```bash
git add site/src/data/products.ts site/src/data/products.test.ts
git commit -m "chore: remove the now-unused hardcoded product catalog"
```

---

### Task 12: Final verification and deploy

**Files:** none (verification and deployment only)

**Interfaces:** none new.

- [ ] **Step 1: Full local check**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm test && npm run build`
Expected: PASS.

- [ ] **Step 2: Run the site locally and browser-check the golden path**

Run: `export PATH="/c/Users/B/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && cd site && npm run dev` (in the background), then open the local URL in a browser and verify:
- Home page: New Stock strip, Featured Picks, and Shop by Category all render real products/images (not skeletons stuck loading, not broken images).
- Shop page: all 20 products list; filtering by category, size, and availability each narrows the list correctly; sort options work.
- A product detail page loads, shows the correct category label, price, sizes, and 2 images; "You Might Also Like" shows other products from the same category.
- Add an item to the cart from a product card and from the product detail page; open the cart drawer; confirm the line item, quantity steppers, and total render correctly; confirm the WhatsApp link still includes the itemized list (this was working before this migration and must still work identically).
- Stop the dev server when done.

- [ ] **Step 3: Add environment variables to Vercel**

In the Vercel project dashboard (Settings → Environment Variables), add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as `site/.env.local`, scoped to Production (and Preview, if desired). Do not add `SUPABASE_SERVICE_ROLE_KEY` here — it is never used by the deployed app.

- [ ] **Step 4: Push and verify the live deploy**

Push the branch (or merge, per whatever integration path the human partner chooses at the end of this plan via `finishing-a-development-branch`) and confirm the Vercel deployment succeeds. Open the live URL and repeat the golden-path checks from Step 2 against production.

- [ ] **Step 5: Report completion**

Confirm to the human partner: the site is now fully backed by Supabase, the visible catalog is unchanged, and the codebase is ready for the admin panel (a separate follow-up plan).
