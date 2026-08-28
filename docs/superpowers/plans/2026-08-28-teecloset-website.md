# Tee Closet Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Tee Closet premium fashion e-commerce marketing site (React + Vite + Tailwind, WhatsApp-driven ordering, mock product catalog) as a portfolio-quality, mobile-first frontend.

**Architecture:** New Vite/React/TS project at `E:\qxai\teecloset\site`, Tailwind v4 CSS-first theming built from the brand's exact design tokens, `react-router-dom` for routing with filters in URL search params, a typed mock product catalog behind a small query API (`getProducts`/`getProductBySlug`) so a real backend can be swapped in later, and a persisted Zustand wishlist store. No cart/checkout — WhatsApp deep links are the order mechanism.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), react-router-dom v7, zustand v5, `@fontsource/*` for self-hosted fonts, vitest + @testing-library/react for tests, oxlint for linting.

**Spec:** `E:\qxai\teecloset\docs\superpowers\specs\2026-08-28-teecloset-website-design.md`

## Global Constraints

- Colors (exact, do not alter): Espresso `#171513`, Champagne `#B89A72`, Cream `#F7F3ED`, Ivory `#FFFCF7`, Taupe `#8C7A68`, Mocha `#3A3028`, Sand `#DED3C4`. Ratio ~60% cream/ivory, 25% espresso/mocha, 10% champagne, 5% taupe. No neon, no purple/blue gradients, no bright gold.
- Brand tagline (from logo, use verbatim): "style. confidence. you."
- WhatsApp order number: `254714713575` (wa.me id, no `+`).
- TikTok: `https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW`.
- Shop location: Maps link `https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac`, coordinates `-0.426654, 36.955100`. Never invent an address, landmark, or opening hours.
- Sizes are always drawn from `26 | 28 | 30 | 32 | 34 | 36 | 38 | 40`.
- Prices vary per item in KSh — never hard-code one universal price.
- All product data access goes through `getProducts()` / `getProductBySlug()` / `getRelatedProducts()` — components never import the product array directly.
- No lorem ipsum anywhere — all copy is real, on-brand Tee Closet content.
- `E:\qxai\app` is a separate, unrelated project (trading-bot builder) — never modify it or copy its brand content, only its tooling *patterns* (Tailwind v4 CSS-first theming, tsconfig shape) as reference.
- Project root for git purposes is `E:\qxai\teecloset` (already initialized, first commit done). Every task ends with a commit from within `E:\qxai\teecloset`, staging paths under `site/`.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `site/package.json`
- Create: `site/tsconfig.json`
- Create: `site/tsconfig.app.json`
- Create: `site/tsconfig.node.json`
- Create: `site/vite.config.ts`
- Create: `site/index.html`
- Create: `site/.oxlintrc.json`
- Create: `site/.gitignore`
- Create: `site/src/main.tsx`
- Create: `site/src/App.tsx`
- Create: `site/src/lib/cn.ts`
- Create: `site/src/test/setup.ts`
- Test: `site/src/App.test.tsx`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `src/lib/cn.ts`, used by every component that needs conditional Tailwind classes.
- Produces: `<App />` default export mounted in `main.tsx`, root element every later route attaches to.

- [ ] **Step 1: Create `site/package.json`**

```json
{
  "name": "teecloset-site",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "test": "vitest run",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fontsource/inter": "^5.3.0",
    "@fontsource/playfair-display": "^5.3.0",
    "clsx": "^2.1.1",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "jsdom": "^29.1.1",
    "oxlint": "^1.79.0",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.2",
    "vite": "^8.2.2",
    "vitest": "^4.1.11"
  }
}
```

- [ ] **Step 2: Create `site/tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 3: Create `site/tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `site/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `site/vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
  },
})
```

- [ ] **Step 6: Create `site/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Tee Closet — style. confidence. you. Premium wide-leg pants, blazers, tops, official pants, chinos and palazzo pants in Kenya. Shop new stock and order on WhatsApp."
    />
    <meta name="color-scheme" content="light" />
    <title>Tee Closet — style. confidence. you.</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `site/.oxlintrc.json`**

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

- [ ] **Step 8: Create `site/.gitignore`**

```
node_modules
dist
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 9: Create `site/src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
```

- [ ] **Step 10: Create `site/src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 11: Write the failing smoke test — `site/src/App.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App', () => {
  it('renders the Tee Closet brand name', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText(/tee closet/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 12: Create minimal `site/src/App.tsx` and `site/src/main.tsx` to pass it**

`site/src/App.tsx`:

```tsx
export function App() {
  return (
    <main>
      <h1>Tee Closet</h1>
    </main>
  )
}
```

`site/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

Also create an empty `site/src/index.css` (populated in Task 2) with just:

```css
@import "tailwindcss";
```

- [ ] **Step 13: Install dependencies**

Run from `E:\qxai\teecloset\site`:

```bash
npm install
```

- [ ] **Step 14: Run the test suite and verify it passes**

Run: `npm test`
Expected: `App` test PASSes (1 passed).

- [ ] **Step 15: Run typecheck and build to verify the scaffold is sound**

Run: `npm run build`
Expected: builds cleanly to `dist/` with no TypeScript errors.

- [ ] **Step 16: Commit**

```bash
cd E:\qxai\teecloset
git add site/package.json site/tsconfig.json site/tsconfig.app.json site/tsconfig.node.json site/vite.config.ts site/index.html site/.oxlintrc.json site/.gitignore site/src/main.tsx site/src/App.tsx site/src/App.test.tsx site/src/lib/cn.ts site/src/test/setup.ts site/src/index.css
git commit -m "Scaffold Tee Closet site (Vite + React + TS + Tailwind v4)"
```

Note: `site/package-lock.json` is generated by `npm install` in Step 13 — stage and include it in this commit too (`git add site/package-lock.json`).

---

### Task 2: Design tokens & global styles

**Files:**
- Create: `site/src/styles/tokens.css`
- Modify: `site/src/index.css`
- Test: `site/src/styles/tokens.test.ts`

**Interfaces:**
- Consumes: nothing (leaf CSS layer).
- Produces: CSS custom properties (`--color-espresso`, `--color-champagne`, `--color-cream`, `--color-ivory`, `--color-taupe`, `--color-mocha`, `--color-sand`, `--font-display`, `--font-body`, `--radius-*`) and matching Tailwind theme keys (`bg-espresso`, `text-champagne`, `font-display`, etc.) that every later component uses instead of hardcoded hex values.

- [ ] **Step 1: Write the failing test — `site/src/styles/tokens.test.ts`**

This test parses the raw CSS file and asserts the exact brand hex values are present, so a future edit can't silently drift from the brand spec.

```ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf-8')

describe('brand tokens', () => {
  it.each([
    ['--color-espresso', '#171513'],
    ['--color-champagne', '#B89A72'],
    ['--color-cream', '#F7F3ED'],
    ['--color-ivory', '#FFFCF7'],
    ['--color-taupe', '#8C7A68'],
    ['--color-mocha', '#3A3028'],
    ['--color-sand', '#DED3C4'],
  ])('defines %s as %s', (name, value) => {
    expect(css).toContain(`${name}: ${value}`)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `tokens.css` does not exist yet.

- [ ] **Step 3: Create `site/src/styles/tokens.css`**

```css
@import "tailwindcss";

:root {
  /* ---- Primitives (exact brand spec — do not alter) ---- */
  --color-espresso: #171513;
  --color-champagne: #B89A72;
  --color-cream: #F7F3ED;
  --color-ivory: #FFFCF7;
  --color-taupe: #8C7A68;
  --color-mocha: #3A3028;
  --color-sand: #DED3C4;

  /* ---- Semantic ---- */
  --color-bg: var(--color-cream);
  --color-surface: var(--color-ivory);
  --color-fg: var(--color-espresso);
  --color-fg-muted: var(--color-taupe);
  --color-border: var(--color-sand);
  --color-accent: var(--color-champagne);
  --color-accent-fg: var(--color-espresso);
  --color-inverse-bg: var(--color-mocha);
  --color-inverse-fg: var(--color-ivory);

  --font-display: 'Playfair Display', ui-serif, Georgia, serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}

/* ---- Map semantic tokens into Tailwind's utility namespace ---- */
@theme inline {
  --color-espresso: var(--color-espresso);
  --color-champagne: var(--color-champagne);
  --color-cream: var(--color-cream);
  --color-ivory: var(--color-ivory);
  --color-taupe: var(--color-taupe);
  --color-mocha: var(--color-mocha);
  --color-sand: var(--color-sand);

  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-fg: var(--color-fg);
  --color-fg-muted: var(--color-fg-muted);
  --color-border: var(--color-border);
  --color-accent: var(--color-accent);
  --color-accent-fg: var(--color-accent-fg);
  --color-inverse-bg: var(--color-inverse-bg);
  --color-inverse-fg: var(--color-inverse-fg);

  --font-display: var(--font-display);
  --font-body: var(--font-body);

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}
```

- [ ] **Step 4: Update `site/src/index.css`**

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/playfair-display/500.css';
@import '@fontsource/playfair-display/600.css';
@import '@fontsource/playfair-display/700.css';
@import './styles/tokens.css';

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (tokens test + App test both green).

- [ ] **Step 6: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/styles/tokens.css site/src/styles/tokens.test.ts site/src/index.css
git commit -m "Add Tee Closet brand design tokens and global styles"
```

---

### Task 3: Data model & mock product catalog

**Files:**
- Create: `site/src/data/types.ts`
- Create: `site/src/data/categories.ts`
- Create: `site/src/data/products.ts`
- Test: `site/src/data/products.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: types `Category`, `Size`, `Availability`, `Product`, `SortOption`, `ProductFilters` from `data/types.ts`; `CATEGORIES: CategoryMeta[]` and `getCategoryLabel(slug: Category): string` from `data/categories.ts`; `getProducts(filters?: ProductFilters): Product[]`, `getProductBySlug(slug: string): Product | undefined`, `getRelatedProducts(product: Product, limit?: number): Product[]` from `data/products.ts`. Every later task that touches products imports only these — never the raw array. Product `images` are public-folder paths (e.g. `/products/wide-leg-1.jpg`), populated by Task 15; until then they 404 gracefully as broken `<img>` (no build/runtime error).

- [ ] **Step 1: Write the failing tests — `site/src/data/products.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { getProducts, getProductBySlug, getRelatedProducts } from './products'

describe('getProducts', () => {
  it('returns all 20 seed products with no filters', () => {
    expect(getProducts()).toHaveLength(20)
  })

  it('filters by category', () => {
    const results = getProducts({ category: 'blazers' })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((p) => p.category === 'blazers')).toBe(true)
  })

  it('filters by size', () => {
    const results = getProducts({ size: 40 })
    expect(results.every((p) => p.sizes.includes(40))).toBe(true)
  })

  it('filters by availability', () => {
    const results = getProducts({ availability: 'sold' })
    expect(results.every((p) => p.availability === 'sold')).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('sorts by price ascending', () => {
    const results = getProducts({ sort: 'price-asc' })
    for (let i = 1; i < results.length; i++) {
      expect(results[i].priceKsh).toBeGreaterThanOrEqual(results[i - 1].priceKsh)
    }
  })

  it('does not hard-code a single universal price', () => {
    const prices = new Set(getProducts().map((p) => p.priceKsh))
    expect(prices.size).toBeGreaterThan(1)
  })
})

describe('getProductBySlug', () => {
  it('finds a known product', () => {
    expect(getProductBySlug('espresso-tailored-blazer')?.name).toBe('Espresso Tailored Blazer')
  })

  it('returns undefined for an unknown slug', () => {
    expect(getProductBySlug('does-not-exist')).toBeUndefined()
  })
})

describe('getRelatedProducts', () => {
  it('returns same-category products excluding itself', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    const related = getRelatedProducts(product)
    expect(related.every((p) => p.category === 'blazers' && p.id !== product.id)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./products` module does not exist yet.

- [ ] **Step 3: Create `site/src/data/types.ts`**

```ts
export type Category =
  | 'wide-leg'
  | 'blazers'
  | 'tops'
  | 'official-pants'
  | 'chinos'
  | 'palazzo'

export type Size = 26 | 28 | 30 | 32 | 34 | 36 | 38 | 40

export type Availability = 'in-stock' | 'limited' | 'sold'

export interface Product {
  id: string
  slug: string
  name: string
  category: Category
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
  category?: Category
  size?: Size
  availability?: Availability
  sort?: SortOption
}
```

- [ ] **Step 4: Create `site/src/data/categories.ts`**

```ts
import type { Category } from './types'

export interface CategoryMeta {
  slug: Category
  label: string
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: 'wide-leg', label: 'Wide-Leg Pants' },
  { slug: 'blazers', label: 'Blazers' },
  { slug: 'tops', label: 'Tops' },
  { slug: 'official-pants', label: 'Official Pants' },
  { slug: 'chinos', label: 'Chinos' },
  { slug: 'palazzo', label: 'Palazzo Pants' },
]

export function getCategoryLabel(slug: Category): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug
}
```

- [ ] **Step 5: Create `site/src/data/products.ts`**

```ts
import type { Product, ProductFilters } from './types'

const WIDE_LEG_IMAGES = ['/products/wide-leg-1.jpg', '/products/wide-leg-2.jpg']
const BLAZER_IMAGES = ['/products/blazers-1.jpg', '/products/blazers-2.jpg']
const TOP_IMAGES = ['/products/tops-1.jpg', '/products/tops-2.jpg']
const OFFICIAL_PANTS_IMAGES = ['/products/official-pants-1.jpg', '/products/official-pants-2.jpg']
const CHINO_IMAGES = ['/products/chinos-1.jpg', '/products/chinos-2.jpg']
const PALAZZO_IMAGES = ['/products/palazzo-1.jpg', '/products/palazzo-2.jpg']

const PRODUCTS: Product[] = [
  {
    id: 'p01', slug: 'camel-wide-leg-trousers', name: 'Camel Wide-Leg Trousers',
    category: 'wide-leg', priceKsh: 2800, sizes: [28, 30, 32, 34, 36], colors: ['Camel'],
    availability: 'in-stock', isNew: true, isFeatured: true,
    description: 'High-waisted wide-leg trousers in a soft camel drape that moves with you.',
    stylingNote: 'Pair with a fitted top and heels for the office, or sneakers for a relaxed weekend look.',
    images: WIDE_LEG_IMAGES,
  },
  {
    id: 'p02', slug: 'black-wide-leg-trousers', name: 'Black Wide-Leg Trousers',
    category: 'wide-leg', priceKsh: 2600, sizes: [26, 28, 30, 32, 34, 36, 38], colors: ['Black'],
    availability: 'in-stock', isNew: false, isFeatured: false,
    description: 'A closet staple — flowy black wide-legs that flatter every body shape.',
    stylingNote: 'Effortless with a crisp white shirt or a cropped blazer.',
    images: WIDE_LEG_IMAGES,
  },
  {
    id: 'p03', slug: 'rust-wide-leg-trousers', name: 'Rust Wide-Leg Trousers',
    category: 'wide-leg', priceKsh: 2700, sizes: [30, 32, 34], colors: ['Rust'],
    availability: 'limited', isNew: true, isFeatured: false,
    description: "A statement rust wide-leg in limited stock — once it's gone, it's gone.",
    stylingNote: 'Let the colour lead: keep the top simple in black or cream.',
    images: WIDE_LEG_IMAGES,
  },
  {
    id: 'p04', slug: 'sand-wide-leg-linen-trousers', name: 'Sand Wide-Leg Linen Trousers',
    category: 'wide-leg', priceKsh: 2900, sizes: [28, 30, 32, 34, 36, 38, 40], colors: ['Sand', 'White'],
    availability: 'in-stock', isNew: false, isFeatured: false,
    description: "Breathable linen-blend wide-legs in warm sand, built for Nairobi's sunny days.",
    stylingNote: 'Style with a fitted tank and slides for an easy daytime look.',
    images: WIDE_LEG_IMAGES,
  },
  {
    id: 'p05', slug: 'espresso-tailored-blazer', name: 'Espresso Tailored Blazer',
    category: 'blazers', priceKsh: 3500, sizes: [30, 32, 34, 36, 38], colors: ['Espresso Black'],
    availability: 'in-stock', isNew: true, isFeatured: true,
    description: 'A sharply tailored espresso blazer that instantly elevates any outfit.',
    stylingNote: 'Wear open over a simple tee and jeans, or buttoned for the boardroom.',
    images: BLAZER_IMAGES,
  },
  {
    id: 'p06', slug: 'camel-oversized-blazer', name: 'Camel Oversized Blazer',
    category: 'blazers', priceKsh: 3200, sizes: [28, 30, 32, 34, 36], colors: ['Camel'],
    availability: 'in-stock', isNew: false, isFeatured: true,
    description: 'An oversized camel blazer with clean lines for that quiet-luxury look.',
    stylingNote: 'Roll the sleeves and pair with wide-leg trousers for a full monochrome moment.',
    images: BLAZER_IMAGES,
  },
  {
    id: 'p07', slug: 'pinstripe-power-blazer', name: 'Pinstripe Power Blazer',
    category: 'blazers', priceKsh: 3400, sizes: [32, 34, 36, 38, 40], colors: ['Charcoal Pinstripe'],
    availability: 'limited', isNew: true, isFeatured: false,
    description: 'A structured pinstripe blazer with serious boardroom presence — limited pieces only.',
    stylingNote: 'Layer over a champagne cami for evening, or a plain white shirt for the office.',
    images: BLAZER_IMAGES,
  },
  {
    id: 'p08', slug: 'cream-linen-blazer', name: 'Cream Linen Blazer',
    category: 'blazers', priceKsh: 3100, sizes: [30, 32, 34, 36], colors: ['Cream'],
    availability: 'sold', isNew: false, isFeatured: false,
    description: 'A soft cream linen blazer — one of our most-loved one-off pieces.',
    stylingNote: 'Was styled beautifully over a black slip dress — check New Stock for the next drop.',
    images: BLAZER_IMAGES,
  },
  {
    id: 'p09', slug: 'ivory-wrap-top', name: 'Ivory Wrap Top',
    category: 'tops', priceKsh: 1200, sizes: [26, 28, 30, 32, 34], colors: ['Ivory'],
    availability: 'in-stock', isNew: true, isFeatured: true,
    description: 'A soft ivory wrap top that ties at the waist for an adjustable, flattering fit.',
    stylingNote: 'Tuck into wide-legs or palazzo pants for a polished silhouette.',
    images: TOP_IMAGES,
  },
  {
    id: 'p10', slug: 'champagne-satin-cami', name: 'Champagne Satin Cami',
    category: 'tops', priceKsh: 1400, sizes: [28, 30, 32, 34, 36], colors: ['Champagne'],
    availability: 'limited', isNew: true, isFeatured: false,
    description: 'A champagne satin cami with a subtle sheen, perfect under a blazer.',
    stylingNote: 'Dress up with the Espresso Tailored Blazer, or wear alone for evening.',
    images: TOP_IMAGES,
  },
  {
    id: 'p11', slug: 'black-corset-top', name: 'Black Corset Top',
    category: 'tops', priceKsh: 1600, sizes: [26, 28, 30, 32, 34, 36], colors: ['Black'],
    availability: 'in-stock', isNew: false, isFeatured: true,
    description: 'A structured black corset top that cinches the waist and holds its shape.',
    stylingNote: 'Balance the fitted top with our flowy Cream Palazzo Pants.',
    images: TOP_IMAGES,
  },
  {
    id: 'p12', slug: 'mocha-off-shoulder-top', name: 'Mocha Off-Shoulder Top',
    category: 'tops', priceKsh: 1300, sizes: [28, 30, 32, 34], colors: ['Mocha'],
    availability: 'in-stock', isNew: false, isFeatured: false,
    description: 'An off-shoulder top in warm mocha with a relaxed, breezy fit.',
    stylingNote: 'Perfect with denim or our Sand Chino Pants for a laid-back day out.',
    images: TOP_IMAGES,
  },
  {
    id: 'p13', slug: 'charcoal-official-trousers', name: 'Charcoal Official Trousers',
    category: 'official-pants', priceKsh: 2400, sizes: [28, 30, 32, 34, 36, 38, 40], colors: ['Charcoal'],
    availability: 'in-stock', isNew: false, isFeatured: true,
    description: 'Sharp charcoal official trousers, tailored for the modern workweek.',
    stylingNote: 'Classic with a fitted blouse and low heels for the office.',
    images: OFFICIAL_PANTS_IMAGES,
  },
  {
    id: 'p14', slug: 'navy-official-trousers', name: 'Navy Official Trousers',
    category: 'official-pants', priceKsh: 2400, sizes: [30, 32, 34, 36, 38], colors: ['Navy'],
    availability: 'in-stock', isNew: false, isFeatured: false,
    description: 'Crisp navy official trousers with a clean, straight-leg cut.',
    stylingNote: 'Pairs effortlessly with white or ivory tops for a fresh, professional look.',
    images: OFFICIAL_PANTS_IMAGES,
  },
  {
    id: 'p15', slug: 'black-slim-official-trousers', name: 'Black Slim Official Trousers',
    category: 'official-pants', priceKsh: 2500, sizes: [26, 28, 30, 32, 34], colors: ['Black'],
    availability: 'limited', isNew: true, isFeatured: false,
    description: 'Slim-fit black official trousers, limited stock, tailored close to the body.',
    stylingNote: 'Wear with the Black Corset Top and a blazer for a sleek all-black look.',
    images: OFFICIAL_PANTS_IMAGES,
  },
  {
    id: 'p16', slug: 'sand-chino-pants', name: 'Sand Chino Pants',
    category: 'chinos', priceKsh: 2200, sizes: [28, 30, 32, 34, 36, 38], colors: ['Sand'],
    availability: 'in-stock', isNew: false, isFeatured: true,
    description: 'Everyday sand chinos with a comfortable straight fit.',
    stylingNote: 'An easy pairing with any of our tops — the definition of Tee Closet versatile.',
    images: CHINO_IMAGES,
  },
  {
    id: 'p17', slug: 'olive-chino-pants', name: 'Olive Chino Pants',
    category: 'chinos', priceKsh: 2200, sizes: [30, 32, 34, 36], colors: ['Olive'],
    availability: 'in-stock', isNew: true, isFeatured: false,
    description: 'Olive chinos with a modern tapered leg — new stock just in.',
    stylingNote: 'Style with the Mocha Off-Shoulder Top for a soft, earthy palette.',
    images: CHINO_IMAGES,
  },
  {
    id: 'p18', slug: 'taupe-straight-chinos', name: 'Taupe Straight Chinos',
    category: 'chinos', priceKsh: 2300, sizes: [28, 30, 32, 34, 36, 38, 40], colors: ['Taupe'],
    availability: 'in-stock', isNew: false, isFeatured: false,
    description: 'Straight-leg taupe chinos — smart enough for work, relaxed enough for weekends.',
    stylingNote: 'Roll the hem and wear with loafers for a polished off-duty look.',
    images: CHINO_IMAGES,
  },
  {
    id: 'p19', slug: 'cream-flowy-palazzo-pants', name: 'Cream Flowy Palazzo Pants',
    category: 'palazzo', priceKsh: 2600, sizes: [28, 30, 32, 34, 36], colors: ['Cream'],
    availability: 'in-stock', isNew: true, isFeatured: true,
    description: 'Flowy cream palazzo pants that move beautifully with every step.',
    stylingNote: 'Pair with the Black Corset Top for contrast, or keep it tonal with ivory.',
    images: PALAZZO_IMAGES,
  },
  {
    id: 'p20', slug: 'rust-printed-palazzo-pants', name: 'Rust Printed Palazzo Pants',
    category: 'palazzo', priceKsh: 2700, sizes: [30, 32, 34, 36, 38], colors: ['Rust Print'],
    availability: 'limited', isNew: true, isFeatured: false,
    description: 'Statement printed palazzo pants in warm rust tones — a limited run.',
    stylingNote: 'Let the print be the star — style with a plain black or ivory top.',
    images: PALAZZO_IMAGES,
  },
]

export function getProducts(filters: ProductFilters = {}): Product[] {
  let results = [...PRODUCTS]

  if (filters.category) {
    results = results.filter((p) => p.category === filters.category)
  }
  if (filters.size) {
    results = results.filter((p) => p.sizes.includes(filters.size!))
  }
  if (filters.availability) {
    results = results.filter((p) => p.availability === filters.availability)
  }

  switch (filters.sort) {
    case 'price-asc':
      results.sort((a, b) => a.priceKsh - b.priceKsh)
      break
    case 'price-desc':
      results.sort((a, b) => b.priceKsh - a.priceKsh)
      break
    case 'popular':
      results.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
      break
    case 'newest':
    default:
      results.sort((a, b) => Number(b.isNew) - Number(a.isNew))
      break
  }

  return results
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, limit)
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all product data tests green.

- [ ] **Step 7: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/data/types.ts site/src/data/categories.ts site/src/data/products.ts site/src/data/products.test.ts
git commit -m "Add Tee Closet product data model and 20-item mock catalog"
```

---

### Task 4: KSh price formatting

**Files:**
- Create: `site/src/lib/format.ts`
- Test: `site/src/lib/format.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `formatKsh(amount: number): string`, used by `ProductCard`, `ProductDetail`, `whatsapp.ts`, and anywhere a price is displayed.

- [ ] **Step 1: Write the failing test — `site/src/lib/format.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { formatKsh } from './format'

describe('formatKsh', () => {
  it('formats with the KSh prefix and thousands separators', () => {
    expect(formatKsh(2800)).toBe('KSh 2,800')
    expect(formatKsh(1200)).toBe('KSh 1,200')
    expect(formatKsh(35000)).toBe('KSh 35,000')
  })

  it('rounds fractional amounts', () => {
    expect(formatKsh(1999.6)).toBe('KSh 2,000')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `./format` module does not exist yet.

- [ ] **Step 3: Create `site/src/lib/format.ts`**

```ts
export function formatKsh(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(Math.round(amount))
  return `KSh ${formatted}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/lib/format.ts site/src/lib/format.test.ts
git commit -m "Add KSh price formatting helper"
```

---

### Task 5: WhatsApp order link builder

**Files:**
- Create: `site/src/lib/whatsapp.ts`
- Test: `site/src/lib/whatsapp.test.ts`

**Interfaces:**
- Consumes: `Product`, `Size` from `@/data/types`; `formatKsh` from `./format`; `getProductBySlug` from `@/data/products` (test only).
- Produces: `buildWhatsAppOrderLink(product: Product, pageUrl: string, size?: Size): string`, used by `ProductCard`, `ProductDetail`, and `WhatsAppFloatingCTA`.

- [ ] **Step 1: Write the failing tests — `site/src/lib/whatsapp.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { buildWhatsAppOrderLink } from './whatsapp'
import { getProductBySlug } from '@/data/products'

describe('buildWhatsAppOrderLink', () => {
  it('builds a wa.me link with product name, price and page url', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    const link = buildWhatsAppOrderLink(product, 'https://teecloset.example/product/espresso-tailored-blazer')

    expect(link).toMatch(/^https:\/\/wa\.me\/254714713575\?text=/)

    const decoded = decodeURIComponent(link.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
    expect(decoded).toContain('KSh 3,500')
    expect(decoded).toContain('https://teecloset.example/product/espresso-tailored-blazer')
    expect(decoded).not.toContain('Size:')
  })

  it('includes the size when provided', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    const link = buildWhatsAppOrderLink(
      product,
      'https://teecloset.example/product/espresso-tailored-blazer',
      34,
    )
    const decoded = decodeURIComponent(link.split('text=')[1])
    expect(decoded).toContain('Size: 34')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./whatsapp` module does not exist yet.

- [ ] **Step 3: Create `site/src/lib/whatsapp.ts`**

```ts
import type { Product, Size } from '@/data/types'
import { formatKsh } from './format'

const WHATSAPP_NUMBER = '254714713575'

export function buildWhatsAppOrderLink(product: Product, pageUrl: string, size?: Size): string {
  const lines = [
    "Hi Tee Closet! I'd like to order:",
    product.name,
    size !== undefined ? `Size: ${size}` : null,
    `Price: ${formatKsh(product.priceKsh)}`,
    `Link: ${pageUrl}`,
  ].filter((line): line is string => line !== null)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/lib/whatsapp.ts site/src/lib/whatsapp.test.ts
git commit -m "Add WhatsApp order link builder"
```

---

### Task 6: Wishlist store

**Files:**
- Create: `site/src/lib/wishlistStore.ts`
- Test: `site/src/lib/wishlistStore.test.ts`

**Interfaces:**
- Consumes: `zustand`, `zustand/middleware` (`persist`).
- Produces: `useWishlistStore` hook exposing `{ productIds: string[], toggle(productId: string): void, isWishlisted(productId: string): boolean }`, used by `WishlistButton`.

- [ ] **Step 1: Write the failing tests — `site/src/lib/wishlistStore.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useWishlistStore } from './wishlistStore'

describe('useWishlistStore', () => {
  beforeEach(() => {
    useWishlistStore.setState({ productIds: [] })
    localStorage.clear()
  })

  it('starts empty', () => {
    expect(useWishlistStore.getState().productIds).toEqual([])
  })

  it('toggles a product into the wishlist', () => {
    useWishlistStore.getState().toggle('p05')
    expect(useWishlistStore.getState().isWishlisted('p05')).toBe(true)
  })

  it('toggles a product out of the wishlist on a second call', () => {
    useWishlistStore.getState().toggle('p05')
    useWishlistStore.getState().toggle('p05')
    expect(useWishlistStore.getState().isWishlisted('p05')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./wishlistStore` module does not exist yet.

- [ ] **Step 3: Create `site/src/lib/wishlistStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  toggle: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'teecloset-wishlist' },
  ),
)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/lib/wishlistStore.ts site/src/lib/wishlistStore.test.ts
git commit -m "Add persisted wishlist store"
```

---

### Task 7: UI primitives (Button, Badge, Skeleton, EmptyState)

**Files:**
- Create: `site/src/components/ui/Button.tsx`, `site/src/components/ui/Button.test.tsx`
- Create: `site/src/components/ui/Badge.tsx`, `site/src/components/ui/Badge.test.tsx`
- Create: `site/src/components/ui/Skeleton.tsx`, `site/src/components/ui/Skeleton.test.tsx`
- Create: `site/src/components/ui/EmptyState.tsx`, `site/src/components/ui/EmptyState.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/cn`.
- Produces: `<Button variant?: 'primary'|'secondary'|'ghost' />`, `<Badge tone?: 'accent'|'neutral'|'muted' />`, `<Skeleton className? />`, `<EmptyState title description action? />` — used throughout Tasks 8–13. No business logic in this layer.

- [ ] **Step 1: Write failing test `Button.test.tsx`**

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders its label and responds to clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Shop Now</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Shop Now' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

Add `@testing-library/user-event` to `site/package.json` devDependencies (`"@testing-library/user-event": "^14.6.1"`) and run `npm install` before this test.

- [ ] **Step 2: Create `site/src/components/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-espresso text-ivory hover:bg-mocha',
  secondary: 'bg-champagne text-espresso hover:brightness-95',
  ghost: 'bg-transparent text-espresso border border-sand hover:bg-sand/30',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Write failing test `Badge.test.tsx`, then create `Badge.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })
})
```

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'accent' | 'neutral' | 'muted'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  accent: 'bg-champagne text-espresso',
  neutral: 'bg-espresso text-ivory',
  muted: 'bg-sand text-espresso',
}

export function Badge({ tone = 'accent', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Write failing test `Skeleton.test.tsx`, then create `Skeleton.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders a status role for loading state', () => {
    render(<Skeleton className="h-4 w-full" />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })
})
```

```tsx
import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-sand/60', className)}
      role="status"
      aria-label="Loading"
    />
  )
}
```

- [ ] **Step 5: Write failing test `EmptyState.test.tsx`, then create `EmptyState.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders a title and description', () => {
    render(<EmptyState title="No products found" description="Try adjusting your filters." />)
    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
  })
})
```

```tsx
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h3 className="font-display text-xl text-espresso">{title}</h3>
      <p className="max-w-sm text-fg-muted">{description}</p>
      {action}
    </div>
  )
}
```

- [ ] **Step 6: Run full test suite to verify everything passes**

Run: `npm test`
Expected: PASS (all `ui/` component tests green).

- [ ] **Step 7: Commit**

```bash
cd E:\qxai\teecloset
git add site/package.json site/package-lock.json site/src/components/ui
git commit -m "Add Button, Badge, Skeleton, EmptyState UI primitives"
```

---

### Task 8: Brand constants, logo, layout shell & routing

**Files:**
- Create: `site/src/lib/constants.ts`, `site/src/lib/constants.test.ts`
- Create: `site/public/logo.png`, `site/public/favicon.png` (copied, not generated)
- Create: `site/src/components/layout/Header.tsx`, `Header.test.tsx`
- Create: `site/src/components/layout/MobileNav.tsx`, `MobileNav.test.tsx`
- Create: `site/src/components/layout/Footer.tsx`, `Footer.test.tsx`
- Create: `site/src/components/layout/WhatsAppFloatingCTA.tsx`, `WhatsAppFloatingCTA.test.tsx`
- Create: `site/src/components/layout/Layout.tsx`
- Create: `site/src/routes/NotFound.tsx`, `NotFound.test.tsx`
- Modify: `site/src/App.tsx`, `site/src/App.test.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/Button`, `useWishlistStore` from `@/lib/wishlistStore`, `cn` from `@/lib/cn`.
- Produces: `WHATSAPP_NUMBER`, `TIKTOK_URL`, `TIKTOK_HANDLE`, `MAPS_URL`, `SHOP_COORDINATES`, `BRAND_TAGLINE`, `buildGeneralWhatsAppLink()` from `@/lib/constants` — the single source of truth every later task (Visit Store, Social Proof, Footer) reads brand contact info from. `<Layout />` renders `<Header/>`, an `<Outlet/>`, `<Footer/>`, `<MobileNav/>`, `<WhatsAppFloatingCTA/>` and is the root element wrapping all routes.

- [ ] **Step 1: Write failing test `site/src/lib/constants.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { WHATSAPP_NUMBER, TIKTOK_URL, MAPS_URL, SHOP_COORDINATES, buildGeneralWhatsAppLink } from './constants'

describe('brand constants', () => {
  it('match the values provided by the brand owner exactly', () => {
    expect(WHATSAPP_NUMBER).toBe('254714713575')
    expect(TIKTOK_URL).toBe('https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW')
    expect(MAPS_URL).toBe('https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac')
    expect(SHOP_COORDINATES).toEqual({ lat: -0.426654, lng: 36.9551 })
  })

  it('builds a general WhatsApp chat link', () => {
    expect(buildGeneralWhatsAppLink()).toMatch(/^https:\/\/wa\.me\/254714713575\?text=/)
  })
})
```

- [ ] **Step 2: Create `site/src/lib/constants.ts`**

```ts
export const WHATSAPP_NUMBER = '254714713575'
export const TIKTOK_URL = 'https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW'
export const TIKTOK_HANDLE = '@tee_closet019'
export const MAPS_URL = 'https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac'
export const SHOP_COORDINATES = { lat: -0.426654, lng: 36.9551 }
export const BRAND_TAGLINE = 'style. confidence. you.'

export function buildGeneralWhatsAppLink(): string {
  const text = encodeURIComponent("Hi Tee Closet! I'd love to know more about your pieces.")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
```

Run `npm test` — expect PASS.

- [ ] **Step 3: Copy the brand logo into `public/`**

```bash
cp "E:\qxai\teecloset\images\file_0000000000d881f4875a0c49caacf42f (1).png" "E:\qxai\teecloset\site\public\logo.png"
cp "E:\qxai\teecloset\images\file_0000000000d881f4875a0c49caacf42f (1).png" "E:\qxai\teecloset\site\public\favicon.png"
```

- [ ] **Step 4: Write failing test `Header.test.tsx`, then create `Header.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'

describe('Header', () => {
  it('renders the Tee Closet logo, primary nav links and a WhatsApp CTA', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.getByAltText(/tee closet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop')
    expect(screen.getByRole('link', { name: /chat on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
```

```tsx
import { Link } from 'react-router-dom'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Tee Closet" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-semibold text-espresso">Tee Closet</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <Link to="/" className="text-sm font-medium text-espresso hover:text-champagne">
            Home
          </Link>
          <Link to="/shop" className="text-sm font-medium text-espresso hover:text-champagne">
            Shop
          </Link>
          <a href="#visit-store" className="text-sm font-medium text-espresso hover:text-champagne">
            Visit Us
          </a>
        </nav>
        <a
          href={buildGeneralWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-full bg-espresso px-5 py-2 text-sm font-medium text-ivory hover:bg-mocha md:inline-flex"
        >
          Chat on WhatsApp
        </a>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Write failing test `MobileNav.test.tsx`, then create `MobileNav.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MobileNav } from './MobileNav'

describe('MobileNav', () => {
  it('renders Home, Shop and WhatsApp tabs', () => {
    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop')
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
```

```tsx
import { Link } from 'react-router-dom'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-sand bg-ivory py-2 md:hidden"
    >
      <Link to="/" className="flex flex-col items-center gap-1 px-4 py-1 text-xs text-espresso">
        Home
      </Link>
      <Link to="/shop" className="flex flex-col items-center gap-1 px-4 py-1 text-xs text-espresso">
        Shop
      </Link>
      <a
        href={buildGeneralWhatsAppLink()}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center gap-1 rounded-full bg-champagne px-4 py-1 text-xs font-medium text-espresso"
      >
        WhatsApp
      </a>
    </nav>
  )
}
```

- [ ] **Step 6: Write failing test `Footer.test.tsx`, then create `Footer.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the brand tagline and a TikTok link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )
    expect(screen.getByText(/style\. confidence\. you\./i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW',
    )
  })
})
```

```tsx
import { Link } from 'react-router-dom'
import { BRAND_TAGLINE, TIKTOK_HANDLE, TIKTOK_URL, buildGeneralWhatsAppLink } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="mt-16 bg-mocha pb-20 pt-12 text-ivory md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:justify-between">
        <div>
          <span className="font-display text-xl font-semibold">Tee Closet</span>
          <p className="mt-2 max-w-xs text-sm text-ivory/70">{BRAND_TAGLINE}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          <Link to="/" className="hover:text-champagne">Home</Link>
          <Link to="/shop" className="hover:text-champagne">Shop</Link>
          <a href="#visit-store" className="hover:text-champagne">Visit Us</a>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="hover:text-champagne">
            TikTok {TIKTOK_HANDLE}
          </a>
          <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer" className="hover:text-champagne">
            WhatsApp us
          </a>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Tee Closet. All rights reserved.
      </p>
    </footer>
  )
}
```

- [ ] **Step 7: Write failing test `WhatsAppFloatingCTA.test.tsx`, then create `WhatsAppFloatingCTA.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatsAppFloatingCTA } from './WhatsAppFloatingCTA'

describe('WhatsAppFloatingCTA', () => {
  it('links to the Tee Closet WhatsApp chat', () => {
    render(<WhatsAppFloatingCTA />)
    expect(screen.getByRole('link', { name: /chat with tee closet on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
```

```tsx
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function WhatsAppFloatingCTA() {
  return (
    <a
      href={buildGeneralWhatsAppLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Tee Closet on WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-champagne text-espresso shadow-lg transition-transform hover:scale-105 md:bottom-6"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.93A9.86 9.86 0 0 0 12.04 2Zm5.8 14.19c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.66-.6-2.93-1.27-4.84-4.2-4.99-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.46.77-2.17 1.04-2.47.27-.29.6-.36.8-.36h.57c.18 0 .43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.6 2 1.1.98 2.03 1.28 2.32 1.43.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.2-.29.4-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.75-.17 1.43Z" />
      </svg>
    </a>
  )
}
```

- [ ] **Step 8: Create `site/src/routes/NotFound.tsx`**

Test `site/src/routes/NotFound.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFound } from './NotFound'

describe('NotFound', () => {
  it('renders a branded 404 message with a link home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )
    expect(screen.getByText(/404/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to shopping/i })).toHaveAttribute('href', '/')
  })
})
```

```tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-6xl text-champagne">404</p>
      <h1 className="font-display text-2xl text-espresso">This piece isn't in our closet</h1>
      <p className="text-fg-muted">The page you're looking for may have sold out or moved.</p>
      <Link to="/">
        <Button>Back to Shopping</Button>
      </Link>
    </div>
  )
}
```

- [ ] **Step 9: Create `site/src/components/layout/Layout.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { WhatsAppFloatingCTA } from './WhatsAppFloatingCTA'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-espresso">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppFloatingCTA />
    </div>
  )
}
```

- [ ] **Step 10: Update `site/src/App.tsx` to wire up routing**

```tsx
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { NotFound } from '@/routes/NotFound'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<h1 className="px-4 py-24 text-center font-display text-3xl">Tee Closet</h1>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
```

(The `/` route's placeholder heading is replaced by the real `Home` component in Task 10–11; `/shop` and `/product/:slug` routes are added in Tasks 12–13.)

- [ ] **Step 11: Update `site/src/App.test.tsx`** (still checks the brand name renders, now via the full routed shell)

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App', () => {
  it('renders the Tee Closet brand name', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getAllByText(/tee closet/i).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 12: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 13: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/lib/constants.ts site/src/lib/constants.test.ts site/public/logo.png site/public/favicon.png site/src/components/layout site/src/routes/NotFound.tsx site/src/routes/NotFound.test.tsx site/src/App.tsx site/src/App.test.tsx
git commit -m "Add layout shell (Header, MobileNav, Footer, WhatsApp CTA) and routing"
```

---

### Task 9: Product components (badge, wishlist, size picker, card, gallery)

**Files:**
- Create: `site/src/components/product/AvailabilityBadge.tsx`, `.test.tsx`
- Create: `site/src/components/product/WishlistButton.tsx`, `.test.tsx`
- Create: `site/src/components/product/SizePicker.tsx`, `.test.tsx`
- Create: `site/src/components/product/ProductCard.tsx`, `.test.tsx`
- Create: `site/src/components/product/ProductGallery.tsx`, `.test.tsx`

**Interfaces:**
- Consumes: `Badge` (`@/components/ui/Badge`), `useWishlistStore` (`@/lib/wishlistStore`), `formatKsh` (`@/lib/format`), `getCategoryLabel` (`@/data/categories`), `Product`/`Size`/`Availability` types.
- Produces: `<AvailabilityBadge availability />`, `<WishlistButton productId />`, `<SizePicker sizes selected? onSelect />`, `<ProductCard product />`, `<ProductGallery images alt />` — all consumed by Shop (Task 12) and Product Detail (Task 13).

- [ ] **Step 1: Write failing test, then create `AvailabilityBadge`**

```tsx
// AvailabilityBadge.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AvailabilityBadge } from './AvailabilityBadge'

describe('AvailabilityBadge', () => {
  it.each([
    ['in-stock', 'In Stock'],
    ['limited', 'Limited Stock'],
    ['sold', 'Sold Out'],
  ] as const)('renders %s as "%s"', (availability, label) => {
    render(<AvailabilityBadge availability={availability} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
```

```tsx
// AvailabilityBadge.tsx
import { Badge } from '@/components/ui/Badge'
import type { Availability } from '@/data/types'

const CONFIG: Record<Availability, { label: string; tone: 'accent' | 'neutral' | 'muted' }> = {
  'in-stock': { label: 'In Stock', tone: 'muted' },
  limited: { label: 'Limited Stock', tone: 'accent' },
  sold: { label: 'Sold Out', tone: 'neutral' },
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const { label, tone } = CONFIG[availability]
  return <Badge tone={tone}>{label}</Badge>
}
```

- [ ] **Step 2: Write failing test, then create `WishlistButton`**

```tsx
// WishlistButton.test.tsx
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWishlistStore } from '@/lib/wishlistStore'
import { WishlistButton } from './WishlistButton'

describe('WishlistButton', () => {
  beforeEach(() => useWishlistStore.setState({ productIds: [] }))

  it('toggles wishlist state on click', async () => {
    render(<WishlistButton productId="p05" />)
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    await userEvent.click(button)
    expect(screen.getByRole('button', { name: /remove from wishlist/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
```

```tsx
// WishlistButton.tsx
import { useWishlistStore } from '@/lib/wishlistStore'
import { cn } from '@/lib/cn'

export function WishlistButton({ productId }: { productId: string }) {
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId))
  const toggle = useWishlistStore((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        toggle(productId)
      }}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow',
        isWishlisted && 'text-champagne',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 21s-7.5-4.6-10-9.1C.6 8.8 2 5 5.6 5c2 0 3.4 1.1 4.4 2.6C11 6.1 12.4 5 14.4 5 18 5 19.4 8.8 22 11.9 19.5 16.4 12 21 12 21Z" />
      </svg>
    </button>
  )
}
```

- [ ] **Step 3: Write failing test, then create `SizePicker`**

```tsx
// SizePicker.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SizePicker } from './SizePicker'

describe('SizePicker', () => {
  it('calls onSelect with the chosen size', async () => {
    const onSelect = vi.fn()
    render(<SizePicker sizes={[30, 32, 34]} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '32' }))
    expect(onSelect).toHaveBeenCalledWith(32)
  })

  it('marks the selected size as pressed', () => {
    render(<SizePicker sizes={[30, 32, 34]} selected={34} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: '34' })).toHaveAttribute('aria-pressed', 'true')
  })
})
```

```tsx
// SizePicker.tsx
import type { Size } from '@/data/types'
import { cn } from '@/lib/cn'

interface SizePickerProps {
  sizes: Size[]
  selected?: Size
  onSelect: (size: Size) => void
}

export function SizePicker({ sizes, selected, onSelect }: SizePickerProps) {
  return (
    <div role="group" aria-label="Select size" className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={selected === size}
          onClick={() => onSelect(size)}
          className={cn(
            'h-10 w-10 rounded-full border text-sm font-medium transition-colors',
            selected === size
              ? 'border-espresso bg-espresso text-ivory'
              : 'border-sand text-espresso hover:border-espresso',
          )}
        >
          {size}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Write failing test, then create `ProductCard`**

```tsx
// ProductCard.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getProductBySlug } from '@/data/products'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('links to the product detail page and shows name, price and availability', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /espresso tailored blazer/i })).toHaveAttribute(
      'href',
      '/product/espresso-tailored-blazer',
    )
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('includes a WhatsApp quick-order link with product name and price', () => {
    const product = getProductBySlug('espresso-tailored-blazer')!
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /order espresso tailored blazer on whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/254714713575'))
    const decoded = decodeURIComponent(link.getAttribute('href')!.split('text=')[1])
    expect(decoded).toContain('Espresso Tailored Blazer')
    expect(decoded).toContain('KSh 3,500')
  })
})
```

```tsx
// ProductCard.tsx
import { Link } from 'react-router-dom'
import type { Product } from '@/data/types'
import { formatKsh } from '@/lib/format'
import { getCategoryLabel } from '@/data/categories'
import { buildWhatsAppOrderLink } from '@/lib/whatsapp'
import { Badge } from '@/components/ui/Badge'
import { AvailabilityBadge } from './AvailabilityBadge'
import { WishlistButton } from './WishlistButton'

export function ProductCard({ product }: { product: Product }) {
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/product/${product.slug}`
      : `/product/${product.slug}`

  return (
    <div className="group relative">
      <Link to={`/product/${product.slug}`} aria-label={product.name} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-sand/40">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.isNew && (
            <div className="absolute left-2 top-2">
              <Badge tone="accent">New</Badge>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-espresso">{product.name}</p>
            <p className="text-xs text-fg-muted">{getCategoryLabel(product.category)}</p>
          </div>
          <p className="text-sm font-semibold text-espresso">{formatKsh(product.priceKsh)}</p>
        </div>
        <div className="mt-1">
          <AvailabilityBadge availability={product.availability} />
        </div>
      </Link>

      <div className="absolute right-2 top-2 flex flex-col gap-2">
        <WishlistButton productId={product.id} />
        {product.availability !== 'sold' && (
          <a
            href={buildWhatsAppOrderLink(product, productUrl)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne text-espresso shadow"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.93A9.86 9.86 0 0 0 12.04 2Zm5.8 14.19c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.66-.6-2.93-1.27-4.84-4.2-4.99-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.46.77-2.17 1.04-2.47.27-.29.6-.36.8-.36h.57c.18 0 .43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.6 2 1.1.98 2.03 1.28 2.32 1.43.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.2-.29.4-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.75-.17 1.43Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
```

Note: `product.name` is now used as both the `Link`'s accessible name and the `aria-label` on the WhatsApp quick-order link — the earlier `ProductGallery`/`Header` tests query by role+name patterns the same way, so this stays consistent with the rest of the suite.

- [ ] **Step 5: Write failing test, then create `ProductGallery`**

```tsx
// ProductGallery.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGallery } from './ProductGallery'

describe('ProductGallery', () => {
  it('shows the first image and switches on thumbnail click', async () => {
    render(<ProductGallery images={['/a.jpg', '/b.jpg']} alt="Test product" />)
    expect(screen.getByAltText('Test product')).toHaveAttribute('src', '/a.jpg')
    await userEvent.click(screen.getByRole('button', { name: 'Show image 2' }))
    expect(screen.getByAltText('Test product')).toHaveAttribute('src', '/b.jpg')
  })
})
```

```tsx
// ProductGallery.tsx
import { useState } from 'react'
import { cn } from '@/lib/cn'

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-sand/40">
        <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                'h-16 w-16 overflow-hidden rounded-md border',
                active === i ? 'border-espresso' : 'border-sand',
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/components/product
git commit -m "Add product components: badge, wishlist, size picker, card, gallery"
```

---

### Task 10: Home page — Hero, New Stock, Categories, Featured

**Files:**
- Create: `site/src/components/home/Hero.tsx`, `.test.tsx`
- Create: `site/src/components/home/NewStockStrip.tsx`, `.test.tsx`
- Create: `site/src/components/home/CategoryGrid.tsx`, `.test.tsx`
- Create: `site/src/components/home/FeaturedGrid.tsx`, `.test.tsx`

**Interfaces:**
- Consumes: `getProducts` (`@/data/products`), `CATEGORIES` (`@/data/categories`), `ProductCard` (`@/components/product/ProductCard`), `Button` (`@/components/ui/Button`), `buildGeneralWhatsAppLink`/`BRAND_TAGLINE` (`@/lib/constants`).
- Produces: `<Hero/>`, `<NewStockStrip/>`, `<CategoryGrid/>`, `<FeaturedGrid/>`, assembled into `Home.tsx` in Task 11.

- [ ] **Step 1: Write failing test, then create `Hero`**

```tsx
// Hero.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders the headline and a Shop link', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/confidence/i)
    expect(screen.getByRole('link', { name: /shop new stock/i })).toHaveAttribute('href', '/shop')
  })
})
```

```tsx
// Hero.tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BRAND_TAGLINE, buildGeneralWhatsAppLink } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-espresso text-ivory">
      <img
        src="/products/hero.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 md:py-32">
        <p className="text-sm uppercase tracking-[0.3em] text-champagne">{BRAND_TAGLINE}</p>
        <h1 className="max-w-lg font-display text-4xl leading-tight md:text-6xl">
          Dress with confidence. Shop the Tee Closet vibe.
        </h1>
        <p className="max-w-md text-ivory/80">
          Premium wide-legs, blazers, tops and more — new stock dropping regularly, straight to your WhatsApp.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/shop">
            <Button variant="secondary">Shop New Stock</Button>
          </Link>
          <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer">
            <Button variant="ghost" className="border-ivory/40 text-ivory hover:bg-ivory/10">
              Chat on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write failing test, then create `NewStockStrip`**

```tsx
// NewStockStrip.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NewStockStrip } from './NewStockStrip'

describe('NewStockStrip', () => {
  it('renders a New Stock heading and at least one product', () => {
    render(
      <MemoryRouter>
        <NewStockStrip />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /new stock/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
```

```tsx
// NewStockStrip.tsx
import { getProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'

export function NewStockStrip() {
  const products = getProducts({ sort: 'newest' })
    .filter((p) => p.isNew)
    .slice(0, 8)

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

- [ ] **Step 3: Write failing test, then create `CategoryGrid`**

```tsx
// CategoryGrid.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryGrid } from './CategoryGrid'

describe('CategoryGrid', () => {
  it('links every category to its filtered shop URL', () => {
    render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /blazers/i })).toHaveAttribute('href', '/shop?category=blazers')
    expect(screen.getByRole('link', { name: /palazzo pants/i })).toHaveAttribute('href', '/shop?category=palazzo')
  })
})
```

```tsx
// CategoryGrid.tsx
import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/data/categories'
import { getProducts } from '@/data/products'

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {CATEGORIES.map((category) => {
          const cover = getProducts({ category: category.slug })[0]?.images[0]
          return (
            <Link
              key={category.slug}
              to={`/shop?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-sand/40"
            >
              {cover && (
                <img
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

- [ ] **Step 4: Write failing test, then create `FeaturedGrid`**

```tsx
// FeaturedGrid.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeaturedGrid } from './FeaturedGrid'

describe('FeaturedGrid', () => {
  it('renders a Featured Picks heading and product cards', () => {
    render(
      <MemoryRouter>
        <FeaturedGrid />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /featured picks/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
```

```tsx
// FeaturedGrid.tsx
import { getProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'

export function FeaturedGrid() {
  const products = getProducts({ sort: 'popular' })
    .filter((p) => p.isFeatured)
    .slice(0, 8)

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

- [ ] **Step 5: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/components/home/Hero.tsx site/src/components/home/Hero.test.tsx site/src/components/home/NewStockStrip.tsx site/src/components/home/NewStockStrip.test.tsx site/src/components/home/CategoryGrid.tsx site/src/components/home/CategoryGrid.test.tsx site/src/components/home/FeaturedGrid.tsx site/src/components/home/FeaturedGrid.test.tsx
git commit -m "Add Home hero, new stock, category grid and featured sections"
```

---

### Task 11: Home page — Why Tee Closet, Visit Store, Social, WhatsApp band, assembly

**Files:**
- Create: `site/src/components/home/WhyTeeCloset.tsx`, `.test.tsx`
- Create: `site/src/components/home/VisitStore.tsx`, `.test.tsx`
- Create: `site/src/components/home/SocialProof.tsx`, `.test.tsx`
- Create: `site/src/components/home/WhatsAppBand.tsx`, `.test.tsx`
- Create: `site/src/routes/Home.tsx`, `.test.tsx`
- Modify: `site/src/App.tsx` (replace the placeholder `/` element with `<Home />`)

**Interfaces:**
- Consumes: `MAPS_URL`, `SHOP_COORDINATES`, `TIKTOK_URL`, `TIKTOK_HANDLE`, `buildGeneralWhatsAppLink` (`@/lib/constants`), `Button` (`@/components/ui/Button`), the four Task 10 home components.
- Produces: `<Home />`, mounted at `/` in `App.tsx`; the `id="visit-store"` anchor target that `Header`/`Footer` "Visit Us" links already point to (Task 8).

- [ ] **Step 1: Write failing test, then create `WhyTeeCloset`**

```tsx
// WhyTeeCloset.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhyTeeCloset } from './WhyTeeCloset'

describe('WhyTeeCloset', () => {
  it('renders the heading and all four reasons', () => {
    render(<WhyTeeCloset />)
    expect(screen.getByRole('heading', { name: /why tee closet/i })).toBeInTheDocument()
    expect(screen.getByText('Shop on WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Limited Drops')).toBeInTheDocument()
  })
})
```

```tsx
// WhyTeeCloset.tsx
const REASONS = [
  { title: 'Tailored Quality', body: 'Every piece is chosen for fit, fabric and finish — fashion that actually lasts.' },
  { title: 'Kenyan-Made for You', body: 'Sizes 26–40, styled for real Nairobi life — from the office to a night out.' },
  { title: 'Shop on WhatsApp', body: 'No accounts, no forms. Message us and we sort you out directly.' },
  { title: 'Limited Drops', body: 'Many pieces are one-off — when it is gone, a new favourite takes its place.' },
]

export function WhyTeeCloset() {
  return (
    <section className="bg-mocha py-16 text-ivory">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl">Why Tee Closet</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.title}>
              <p className="font-display text-lg text-champagne">{reason.title}</p>
              <p className="mt-2 text-sm text-ivory/75">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write failing test, then create `VisitStore`**

```tsx
// VisitStore.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisitStore } from './VisitStore'

describe('VisitStore', () => {
  it('renders the heading, coordinates and a Get Directions link to the exact Maps URL', () => {
    render(<VisitStore />)
    expect(screen.getByRole('heading', { name: /visit our store/i })).toBeInTheDocument()
    expect(screen.getByText(/-0.426654/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get directions/i })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac',
    )
  })
})
```

```tsx
// VisitStore.tsx
import { MAPS_URL, SHOP_COORDINATES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export function VisitStore() {
  return (
    <section id="visit-store" className="mx-auto max-w-6xl px-4 py-16">
      <div className="overflow-hidden rounded-2xl border border-sand bg-ivory p-8 md:p-12">
        <h2 className="font-display text-2xl text-espresso">Visit Our Store</h2>
        <p className="mt-3 max-w-lg text-fg-muted">
          Come see the pieces in person, try them on and get styled by the Tee Closet team.
        </p>
        <p className="mt-4 text-sm text-fg-muted">
          Coordinates: {SHOP_COORDINATES.lat}, {SHOP_COORDINATES.lng}
        </p>
        <a href={MAPS_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block">
          <Button>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            Get Directions
          </Button>
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write failing test, then create `SocialProof`**

```tsx
// SocialProof.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialProof } from './SocialProof'

describe('SocialProof', () => {
  it('links to the exact Tee Closet TikTok URL', () => {
    render(<SocialProof />)
    expect(screen.getByRole('link', { name: /follow on tiktok/i })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW',
    )
  })
})
```

```tsx
// SocialProof.tsx
import { TIKTOK_HANDLE, TIKTOK_URL } from '@/lib/constants'

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h2 className="font-display text-2xl text-espresso">Seen on TikTok</h2>
      <p className="mx-auto mt-3 max-w-md text-fg-muted">
        Follow {TIKTOK_HANDLE} for new stock drops, styling ideas and behind-the-scenes at Tee Closet.
      </p>
      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-espresso px-6 py-3 text-sm font-medium text-espresso hover:bg-espresso hover:text-ivory"
      >
        Follow on TikTok
      </a>
    </section>
  )
}
```

- [ ] **Step 4: Write failing test, then create `WhatsAppBand`**

```tsx
// WhatsAppBand.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatsAppBand } from './WhatsAppBand'

describe('WhatsAppBand', () => {
  it('links to the Tee Closet WhatsApp chat', () => {
    render(<WhatsAppBand />)
    expect(screen.getByRole('link', { name: /order on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })
})
```

```tsx
// WhatsAppBand.tsx
import { Button } from '@/components/ui/Button'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function WhatsAppBand() {
  return (
    <section className="bg-champagne py-12 text-center">
      <h2 className="font-display text-2xl text-espresso">Ready to shop the vibe?</h2>
      <p className="mt-2 text-espresso/80">Message us on WhatsApp — we'll help you find your size and style.</p>
      <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer" className="mt-6 inline-block">
        <Button variant="primary">Order on WhatsApp</Button>
      </a>
    </section>
  )
}
```

- [ ] **Step 5: Write failing test, then create `Home.tsx` and wire it into `App.tsx`**

```tsx
// Home.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'

describe('Home', () => {
  it('renders the hero and the Visit Our Store section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/confidence/i)
    expect(screen.getByRole('heading', { name: /visit our store/i })).toBeInTheDocument()
  })
})
```

```tsx
// Home.tsx
import { Hero } from '@/components/home/Hero'
import { NewStockStrip } from '@/components/home/NewStockStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { WhyTeeCloset } from '@/components/home/WhyTeeCloset'
import { VisitStore } from '@/components/home/VisitStore'
import { SocialProof } from '@/components/home/SocialProof'
import { WhatsAppBand } from '@/components/home/WhatsAppBand'

export function Home() {
  return (
    <>
      <Hero />
      <NewStockStrip />
      <CategoryGrid />
      <FeaturedGrid />
      <WhyTeeCloset />
      <VisitStore />
      <SocialProof />
      <WhatsAppBand />
    </>
  )
}
```

In `site/src/App.tsx`, replace:

```tsx
<Route path="/" element={<h1 className="px-4 py-24 text-center font-display text-3xl">Tee Closet</h1>} />
```

with:

```tsx
<Route path="/" element={<Home />} />
```

and add `import { Home } from '@/routes/Home'` at the top.

- [ ] **Step 6: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/components/home site/src/routes/Home.tsx site/src/routes/Home.test.tsx site/src/App.tsx
git commit -m "Assemble Home page (Why Tee Closet, Visit Store, Social, WhatsApp band)"
```

---

### Task 12: Shop page — filters, sort, URL state, grid

**Files:**
- Create: `site/src/components/shop/FilterPanel.tsx`, `.test.tsx`
- Create: `site/src/components/shop/SortSelect.tsx`, `.test.tsx`
- Create: `site/src/components/shop/ActiveFilterChips.tsx`, `.test.tsx`
- Create: `site/src/routes/Shop.tsx`, `.test.tsx`
- Modify: `site/src/App.tsx` (add `/shop` route)

**Interfaces:**
- Consumes: `getProducts` (`@/data/products`), `getCategoryLabel`/`CATEGORIES` (`@/data/categories`), `ProductCard`, `EmptyState`, `Button`, `cn`, `ProductFilters`/`Category`/`Size`/`Availability`/`SortOption` types.
- Produces: `<Shop />` mounted at `/shop`, reading/writing filters via `useSearchParams` so `/shop?category=blazers&size=32&sort=price-asc` is a shareable, back/forward-navigable URL (per spec §5).

- [ ] **Step 1: Write failing test, then create `FilterPanel`**

```tsx
// FilterPanel.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPanel } from './FilterPanel'

describe('FilterPanel', () => {
  it('calls onChange with the selected category', async () => {
    const onChange = vi.fn()
    render(<FilterPanel filters={{}} onChange={onChange} isOpen onClose={() => {}} />)
    await userEvent.click(screen.getByLabelText('Blazers'))
    expect(onChange).toHaveBeenCalledWith({ category: 'blazers' })
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<FilterPanel filters={{}} onChange={() => {}} isOpen onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close filters/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
```

```tsx
// FilterPanel.tsx
import { CATEGORIES } from '@/data/categories'
import type { Availability, ProductFilters, Size } from '@/data/types'
import { cn } from '@/lib/cn'

const SIZES: Size[] = [26, 28, 30, 32, 34, 36, 38, 40]
const AVAILABILITIES: Availability[] = ['in-stock', 'limited', 'sold']

interface FilterPanelProps {
  filters: ProductFilters
  onChange: (filters: ProductFilters) => void
  isOpen: boolean
  onClose: () => void
}

export function FilterPanel({ filters, onChange, isOpen, onClose }: FilterPanelProps) {
  return (
    <aside
      className={cn(
        'fixed inset-0 z-50 overflow-y-auto bg-cream p-6 md:static md:z-auto md:block md:w-56 md:bg-transparent md:p-0',
        isOpen ? 'block' : 'hidden',
      )}
    >
      <div className="flex items-center justify-between md:hidden">
        <p className="font-display text-lg">Filters</p>
        <button type="button" onClick={onClose} aria-label="Close filters" className="text-espresso">
          Close
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Category</p>
          <div className="mt-2 flex flex-col gap-1">
            {CATEGORIES.map((category) => (
              <label key={category.slug} className="flex items-center gap-2 text-sm text-espresso">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.slug}
                  onChange={() => onChange({ ...filters, category: category.slug })}
                />
                {category.label}
              </label>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...filters, category: undefined })}
              className="mt-1 self-start text-xs text-champagne underline"
            >
              Clear category
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={filters.size === size}
                onClick={() => onChange({ ...filters, size: filters.size === size ? undefined : size })}
                className={cn(
                  'h-9 w-9 rounded-full border text-sm',
                  filters.size === size ? 'border-espresso bg-espresso text-ivory' : 'border-sand text-espresso',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Availability</p>
          <div className="mt-2 flex flex-col gap-1">
            {AVAILABILITIES.map((availability) => (
              <label key={availability} className="flex items-center gap-2 text-sm capitalize text-espresso">
                <input
                  type="radio"
                  name="availability"
                  checked={filters.availability === availability}
                  onChange={() => onChange({ ...filters, availability })}
                />
                {availability.replace('-', ' ')}
              </label>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...filters, availability: undefined })}
              className="mt-1 self-start text-xs text-champagne underline"
            >
              Clear availability
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Write failing test, then create `SortSelect`**

```tsx
// SortSelect.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortSelect } from './SortSelect'

describe('SortSelect', () => {
  it('calls onChange with the newly selected sort option', async () => {
    const onChange = vi.fn()
    render(<SortSelect value="newest" onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc')
    expect(onChange).toHaveBeenCalledWith('price-asc')
  })
})
```

```tsx
// SortSelect.tsx
import type { SortOption } from '@/data/types'

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
]

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-espresso">
      Sort by
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-md border border-sand bg-ivory px-2 py-1"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
```

- [ ] **Step 3: Write failing test, then create `ActiveFilterChips`**

```tsx
// ActiveFilterChips.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveFilterChips } from './ActiveFilterChips'

describe('ActiveFilterChips', () => {
  it('renders a chip for each active filter and removes it on click', async () => {
    const onRemove = vi.fn()
    render(<ActiveFilterChips filters={{ category: 'blazers', size: 32 }} onRemove={onRemove} />)
    expect(screen.getByText(/blazers/i)).toBeInTheDocument()
    await userEvent.click(screen.getByText(/size 32/i))
    expect(onRemove).toHaveBeenCalledWith('size')
  })

  it('renders nothing when there are no active filters', () => {
    const { container } = render(<ActiveFilterChips filters={{}} onRemove={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

```tsx
// ActiveFilterChips.tsx
import { getCategoryLabel } from '@/data/categories'
import type { ProductFilters } from '@/data/types'

interface ActiveFilterChipsProps {
  filters: ProductFilters
  onRemove: (key: keyof ProductFilters) => void
}

export function ActiveFilterChips({ filters, onRemove }: ActiveFilterChipsProps) {
  const chips: { key: keyof ProductFilters; label: string }[] = []
  if (filters.category) chips.push({ key: 'category', label: getCategoryLabel(filters.category) })
  if (filters.size) chips.push({ key: 'size', label: `Size ${filters.size}` })
  if (filters.availability) chips.push({ key: 'availability', label: filters.availability.replace('-', ' ') })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1 text-xs capitalize text-espresso"
        >
          {chip.label} ✕
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Write failing test, then create `Shop.tsx` and wire it into `App.tsx`**

```tsx
// Shop.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Shop } from './Shop'

describe('Shop', () => {
  it('filters products by the category in the URL', () => {
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers']}>
        <Shop />
      </MemoryRouter>,
    )
    expect(screen.getByText('Espresso Tailored Blazer')).toBeInTheDocument()
    expect(screen.queryByText('Camel Wide-Leg Trousers')).not.toBeInTheDocument()
  })

  it('shows an empty state when no products match the filters', () => {
    render(
      <MemoryRouter initialEntries={['/shop?category=blazers&size=26']}>
        <Shop />
      </MemoryRouter>,
    )
    expect(screen.getByText(/no pieces match those filters/i)).toBeInTheDocument()
  })
})
```

```tsx
// Shop.tsx
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '@/data/products'
import type { Category, ProductFilters, Size, SortOption } from '@/data/types'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { FilterPanel } from '@/components/shop/FilterPanel'
import { SortSelect } from '@/components/shop/SortSelect'
import { ActiveFilterChips } from '@/components/shop/ActiveFilterChips'

function parseFilters(params: URLSearchParams): ProductFilters {
  const category = params.get('category') as Category | null
  const size = params.get('size')
  const availability = params.get('availability') as ProductFilters['availability'] | null
  const sort = (params.get('sort') as SortOption | null) ?? 'newest'

  return {
    category: category ?? undefined,
    size: size ? (Number(size) as Size) : undefined,
    availability: availability ?? undefined,
    sort,
  }
}

function toSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.size) params.set('size', String(filters.size))
  if (filters.availability) params.set('availability', filters.availability)
  if (filters.sort) params.set('sort', filters.sort)
  return params
}

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setFilterOpen] = useState(false)
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const products = useMemo(() => getProducts(filters), [filters])

  const updateFilters = (next: ProductFilters) => setSearchParams(toSearchParams(next))
  const removeFilter = (key: keyof ProductFilters) => updateFilters({ ...filters, [key]: undefined })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-espresso">Shop All</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {products.length} piece{products.length === 1 ? '' : 's'}
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

          {products.length === 0 ? (
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
              {products.map((product) => (
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

In `site/src/App.tsx`, add the import `import { Shop } from '@/routes/Shop'` and a new route inside the `<Route element={<Layout />}>` block, directly after the `/` route:

```tsx
<Route path="/shop" element={<Shop />} />
```

- [ ] **Step 5: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/components/shop site/src/routes/Shop.tsx site/src/routes/Shop.test.tsx site/src/App.tsx
git commit -m "Add Shop page with URL-driven filtering and sorting"
```

---

### Task 13: Product Detail page

**Files:**
- Create: `site/src/routes/ProductDetail.tsx`, `.test.tsx`
- Modify: `site/src/App.tsx` (add `/product/:slug` route)

**Interfaces:**
- Consumes: `getProductBySlug`/`getRelatedProducts` (`@/data/products`), `formatKsh`, `buildWhatsAppOrderLink`, `getCategoryLabel`, `ProductGallery`, `SizePicker`, `AvailabilityBadge`, `WishlistButton`, `ProductCard`, `Button`, `NotFound`.
- Produces: `<ProductDetail />` mounted at `/product/:slug`, rendering `NotFound` inline (no redirect) for an unknown slug.

- [ ] **Step 1: Write failing tests — `site/src/routes/ProductDetail.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProductDetail } from './ProductDetail'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:slug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProductDetail', () => {
  it('renders product name, price, styling note and a WhatsApp order link', () => {
    renderAt('/product/espresso-tailored-blazer')
    expect(screen.getByRole('heading', { name: 'Espresso Tailored Blazer' })).toBeInTheDocument()
    expect(screen.getByText('KSh 3,500')).toBeInTheDocument()
    expect(screen.getByText(/wear open over a simple tee/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /order on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
  })

  it('disables ordering for a sold-out product', () => {
    renderAt('/product/cream-linen-blazer')
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled()
  })

  it('renders related products from the same category', () => {
    renderAt('/product/espresso-tailored-blazer')
    expect(screen.getByRole('heading', { name: /you might also like/i })).toBeInTheDocument()
  })

  it('renders NotFound content for an unknown slug', () => {
    renderAt('/product/does-not-exist')
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./ProductDetail` module does not exist yet.

- [ ] **Step 3: Create `site/src/routes/ProductDetail.tsx`**

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductBySlug, getRelatedProducts } from '@/data/products'
import { getCategoryLabel } from '@/data/categories'
import { formatKsh } from '@/lib/format'
import { buildWhatsAppOrderLink } from '@/lib/whatsapp'
import type { Size } from '@/data/types'
import { ProductGallery } from '@/components/product/ProductGallery'
import { SizePicker } from '@/components/product/SizePicker'
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { NotFound } from './NotFound'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? getProductBySlug(slug) : undefined
  const [selectedSize, setSelectedSize] = useState<Size | undefined>()

  if (!product) return <NotFound />

  const related = getRelatedProducts(product)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `/product/${product.slug}`
  const whatsAppLink = buildWhatsAppOrderLink(product, pageUrl, selectedSize)
  const isOrderable = product.availability !== 'sold'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-xs uppercase tracking-wider text-fg-muted">{getCategoryLabel(product.category)}</p>
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
            <a href={whatsAppLink} target="_blank" rel="noreferrer" className="mt-6 block">
              <Button className="w-full">Order on WhatsApp</Button>
            </a>
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

      {related.length > 0 && (
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

- [ ] **Step 4: Wire the route into `site/src/App.tsx`**

Add `import { ProductDetail } from '@/routes/ProductDetail'` and, inside the `<Route element={<Layout />}>` block, add:

```tsx
<Route path="/product/:slug" element={<ProductDetail />} />
```

- [ ] **Step 5: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/routes/ProductDetail.tsx site/src/routes/ProductDetail.test.tsx site/src/App.tsx
git commit -m "Add Product Detail page with sizes, styling notes and related products"
```

---

### Task 14: SEO — per-route metadata, Open Graph, product structured data

**Files:**
- Create: `site/src/components/seo/Seo.tsx`, `.test.tsx`
- Create: `site/public/robots.txt`
- Modify: `site/src/routes/Home.tsx`, `site/src/routes/Shop.tsx`, `site/src/routes/ProductDetail.tsx`, `site/src/routes/NotFound.tsx`

**Interfaces:**
- Consumes: nothing beyond React.
- Produces: `<Seo title description image? structuredData? />`, a side-effect-only component (renders `null`) that sets `document.title`, upserts `<meta name="description">` / Open Graph tags, and injects a `<script type="application/ld+json">` when `structuredData` is passed. Used once per route.

No `react-helmet`-style dependency is added — per the Global Constraints' "avoid unnecessary dependencies," a route only ever mounts one `<Seo>` at a time, so direct DOM mutation in `useEffect` is sufficient and dependency-free.

- [ ] **Step 1: Write failing tests — `site/src/components/seo/Seo.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Seo } from './Seo'

describe('Seo', () => {
  it('sets the document title and description meta tag', () => {
    render(<Seo title="Shop" description="Shop Tee Closet pieces." />)
    expect(document.title).toBe('Shop | Tee Closet')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Shop Tee Closet pieces.',
    )
  })

  it('injects JSON-LD structured data when provided', () => {
    render(<Seo title="Blazer" description="A blazer." structuredData={{ '@type': 'Product' }} />)
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.textContent).toContain('"@type":"Product"')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./Seo` module does not exist yet.

- [ ] **Step 3: Create `site/src/components/seo/Seo.tsx`**

```tsx
import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  image?: string
  structuredData?: Record<string, unknown>
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function Seo({ title, description, image, structuredData }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | Tee Closet`
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    if (image) upsertMeta('property', 'og:image', image)

    let script: HTMLScriptElement | null = null
    if (structuredData) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    return () => {
      if (script) document.head.removeChild(script)
    }
  }, [title, description, image, structuredData])

  return null
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Add `<Seo>` to `Home.tsx`**

At the top of the returned fragment in `site/src/routes/Home.tsx`, add (with `import { Seo } from '@/components/seo/Seo'`):

```tsx
<Seo
  title="Home"
  description="Tee Closet — style. confidence. you. Shop wide-leg pants, blazers, tops, official pants, chinos and palazzo pants in Kenya."
/>
```

- [ ] **Step 6: Add `<Seo>` to `Shop.tsx`**

At the top of the returned `<div>` in `site/src/routes/Shop.tsx`, add (with the same import):

```tsx
<Seo
  title="Shop All"
  description="Browse Tee Closet's full catalogue — wide-leg pants, blazers, tops, official pants, chinos and palazzo pants. Filter by size, category and availability."
/>
```

- [ ] **Step 7: Add `<Seo>` with Product structured data to `ProductDetail.tsx`**

At the top of the returned `<div>` in `site/src/routes/ProductDetail.tsx`, add (with the same import):

```tsx
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
```

- [ ] **Step 8: Add `<Seo>` to `NotFound.tsx`**

```tsx
<Seo title="Page Not Found" description="This page could not be found." />
```

- [ ] **Step 9: Create `site/public/robots.txt`**

```
User-agent: *
Allow: /
```

A `Sitemap:` line and `sitemap.xml` are intentionally deferred — both require a real production domain, which is out of scope until deployment/hosting is decided (see spec §13).

- [ ] **Step 10: Run full test suite and verify everything passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
cd E:\qxai\teecloset
git add site/src/components/seo site/public/robots.txt site/src/routes/Home.tsx site/src/routes/Shop.tsx site/src/routes/ProductDetail.tsx site/src/routes/NotFound.tsx
git commit -m "Add per-route SEO metadata, Open Graph tags and Product structured data"
```

---

### Task 15: On-brand product photography

**Files:**
- Create: `site/public/products/hero.jpg`
- Create: `site/public/products/wide-leg-1.jpg`, `wide-leg-2.jpg`
- Create: `site/public/products/blazers-1.jpg`, `blazers-2.jpg`
- Create: `site/public/products/tops-1.jpg`, `tops-2.jpg`
- Create: `site/public/products/official-pants-1.jpg`, `official-pants-2.jpg`
- Create: `site/public/products/chinos-1.jpg`, `chinos-2.jpg`
- Create: `site/public/products/palazzo-1.jpg`, `palazzo-2.jpg`

**Interfaces:**
- Consumes: nothing in code — this task only produces static files at the exact public paths `data/products.ts` (Task 3) and `Hero.tsx` (Task 10) already reference.
- Produces: 13 image files. No component changes; images just stop 404ing once these files exist.

- [ ] **Step 1: Load the image-generation tool**

Run `ToolSearch` with `query: "select:mcp__claude_ai_higgsfield__generate_image,mcp__claude_ai_higgsfield__generate_image_batch,mcp__claude_ai_higgsfield__jobs_wait,mcp__claude_ai_higgsfield__show_generation_by_ids"` to load the tool schemas, then follow that tool's own documented single/batch generation protocol for the remaining steps.

- [ ] **Step 2: Generate the hero image**

Generate one image for `site/public/products/hero.jpg` with this prompt:

> Editorial fashion photograph, a confident young Kenyan woman wearing an oversized espresso-black blazer over a flowing cream wide-leg trouser, walking on a sunlit Nairobi street, warm champagne-gold light, soft cinematic tones matching a warm luxury palette of espresso black, warm champagne, soft cream and ivory, shot on medium format film, shallow depth of field, premium fashion campaign photography, no text or logos

Download the result and save it to `E:\qxai\teecloset\site\public\products\hero.jpg`.

- [ ] **Step 3: Generate the 12 category images**

Generate one image per prompt below (batch if the tool supports it), download each, and save to the exact path listed:

| Path | Prompt |
|---|---|
| `products/wide-leg-1.jpg` | Editorial flat-lay fashion photograph of a pair of high-waisted wide-leg trousers in camel/sand tone, styled on a soft cream fabric background with warm champagne-gold accessories, soft natural light, premium minimalist fashion photography, no text, no logos |
| `products/wide-leg-2.jpg` | Close-up detail fashion photograph of flowing wide-leg trousers fabric drape and waistband, warm neutral tones of espresso black and cream, soft studio lighting, premium fashion editorial style, no text, no logos |
| `products/blazers-1.jpg` | Editorial fashion photograph of a tailored espresso-black blazer on an elegant wooden hanger against a soft ivory studio backdrop, warm champagne-gold light accents, premium minimalist fashion photography, no text, no logos |
| `products/blazers-2.jpg` | Close-up fashion detail photograph of a tailored blazer lapel and button, espresso black fabric with warm champagne stitching, soft studio lighting, premium editorial style, no text, no logos |
| `products/tops-1.jpg` | Editorial flat-lay fashion photograph of a soft ivory wrap top styled on cream linen fabric with a warm champagne ribbon, soft natural light, premium minimalist fashion photography, no text, no logos |
| `products/tops-2.jpg` | Close-up fashion detail photograph of delicate top fabric texture and neckline, ivory and champagne tones, soft studio lighting, premium editorial style, no text, no logos |
| `products/official-pants-1.jpg` | Editorial fashion photograph of tailored charcoal official trousers laid flat on a soft cream backdrop with warm champagne-gold accessories, soft studio lighting, premium minimalist fashion photography, no text, no logos |
| `products/official-pants-2.jpg` | Close-up fashion detail photograph of tailored trouser waistband and crease, charcoal fabric on cream background, soft studio lighting, premium editorial style, no text, no logos |
| `products/chinos-1.jpg` | Editorial flat-lay fashion photograph of sand-toned chino trousers styled on a warm cream fabric background, soft natural light, premium minimalist fashion photography, no text, no logos |
| `products/chinos-2.jpg` | Close-up fashion detail photograph of chino fabric texture and stitching, sand and taupe tones, soft studio lighting, premium editorial style, no text, no logos |
| `products/palazzo-1.jpg` | Editorial fashion photograph of flowing cream palazzo trousers styled in motion on a soft ivory backdrop, warm champagne-gold light, premium minimalist fashion photography, no text, no logos |
| `products/palazzo-2.jpg` | Close-up fashion detail photograph of flowing palazzo trouser fabric drape, cream and warm sand tones, soft studio lighting, premium editorial style, no text, no logos |

Every prompt already encodes the brand palette (espresso black, warm champagne, soft cream, ivory) — do not add colors outside that palette (no neon, no blue/purple gradients, no bright gold), per the Global Constraints.

- [ ] **Step 4: Verify all 13 files exist and are non-empty**

Run: `ls -la E:/qxai/teecloset/site/public/products`
Expected: 13 files listed, each with a non-zero size.

- [ ] **Step 5: Start the dev server and spot-check images render**

Run: `npm run dev` (from `site/`), then load `/`, `/shop`, and a product detail page in a browser and confirm the hero and product images render (no broken-image icons).

- [ ] **Step 6: Commit**

```bash
cd E:\qxai\teecloset
git add site/public/products
git commit -m "Add on-brand generated product and hero photography"
```

---

### Task 16: Error boundary, accessibility, responsive polish & final verification

**Files:**
- Create: `site/src/components/layout/ErrorBoundary.tsx`, `.test.tsx`
- Modify: `site/src/components/layout/Layout.tsx`
- Modify: any file flagged by the checks below (exact files depend on findings — see step-by-step).

**Interfaces:**
- Consumes: `Button` (`@/components/ui/Button`), `buildGeneralWhatsAppLink` (`@/lib/constants`).
- Produces: `<ErrorBoundary>` — a class component (React error boundaries require the class API; there is no hook equivalent) wrapping `<Outlet />` in `Layout.tsx` so a thrown error in any route (e.g. a future real backend call replacing `getProducts`) shows a branded fallback instead of a blank white screen, per spec §12 ("error boundary for the product data layer").

The remaining steps audit and tighten everything built in Tasks 1–15 against spec §12 (non-functional requirements) and the master prompt's Phase 17–18 quality bar. No placeholders here because the fixes in Step 12 are contingent on what the checks find; each sub-step is a concrete, runnable check with a clear pass condition.

- [ ] **Step 1: Write the failing tests — `site/src/components/layout/ErrorBoundary.test.tsx`**

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders a branded fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /message us on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/254714713575'),
    )
    consoleError.mockRestore()
  })

  it('renders children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./ErrorBoundary` module does not exist yet.

- [ ] **Step 3: Create `site/src/components/layout/ErrorBoundary.tsx`**

```tsx
import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
          <h1 className="font-display text-2xl text-espresso">Something went wrong</h1>
          <p className="text-fg-muted">
            We couldn't load this page. Please refresh, or message us on WhatsApp if it keeps happening.
          </p>
          <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer">
            <Button>Message Us on WhatsApp</Button>
          </a>
        </div>
      )
    }

    return this.props.children
  }
}
```

- [ ] **Step 4: Wrap `<Outlet />` with `<ErrorBoundary>` in `site/src/components/layout/Layout.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { WhatsAppFloatingCTA } from './WhatsAppFloatingCTA'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-espresso">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppFloatingCTA />
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Lint**

Run: `npm run lint` (from `site/`)
Expected: no errors. Fix any reported issues in the flagged files (e.g. `react/rules-of-hooks`, unused vars) and re-run until clean.

- [ ] **Step 7: Typecheck + build**

Run: `npm run build`
Expected: builds cleanly to `dist/` with zero TypeScript errors. Fix any type errors surfaced.

- [ ] **Step 8: Full test suite**

Run: `npm test`
Expected: every test from Tasks 1–16 passes.

- [ ] **Step 9: Browser verification — desktop**

Start `npm run dev`, open the site in a browser at a desktop viewport (≥1280px) and check, page by page: Home (all 8 sections render, hero CTA and WhatsApp CTA work, Visit Our Store "Get Directions" opens the exact Maps URL), Shop (filtering by category/size/availability updates the URL and grid, sort works, empty state appears for an impossible combination), a Product Detail page (gallery thumbnails switch the main image, size picker selects, WhatsApp CTA text includes product name/size/price/URL, related products link out, sold-out product shows a disabled "Sold Out" button), and `/does-not-exist` (branded 404 with a working "Back to Shopping" link). Check the browser console for errors on every page — there must be none.

- [ ] **Step 10: Browser verification — mobile**

Resize to a small-Android width (~360px) and re-check the same pages: the bottom `MobileNav` tab bar is visible and usable, the floating WhatsApp button doesn't overlap it, the Shop filter drawer opens/closes cleanly, product grids reflow to 2 columns, no horizontal overflow anywhere, and all tap targets are comfortably touchable (≥44px).

- [ ] **Step 11: Accessibility pass**

Using the browser's accessibility tree / keyboard only: confirm every interactive element (nav links, filter controls, size picker buttons, wishlist heart, WhatsApp CTAs) is reachable via Tab and shows a visible focus ring; confirm every `<img>` has meaningful `alt` text (decorative images like the hero background already use `alt=""` with `aria-hidden`); confirm body text color combinations (espresso/taupe on cream/ivory) meet at least 4.5:1 contrast — if any component was styled with champagne text on a light background for body copy, darken it to espresso/mocha (champagne stays reserved for accents, badges, and text-on-dark per the Global Constraints).

- [ ] **Step 12: Fix any issues found in Steps 9–11**

Apply targeted fixes in the relevant component files. Re-run Steps 6–8 after each fix.

- [ ] **Step 13: Final commit**

```bash
cd E:\qxai\teecloset
git add -A
git commit -m "Add error boundary; accessibility, responsive and final polish pass"
```

