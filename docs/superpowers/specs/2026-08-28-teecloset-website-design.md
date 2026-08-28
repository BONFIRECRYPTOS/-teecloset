# Tee Closet Website — Design Spec

**Date:** 2026-08-28
**Status:** Approved for implementation planning
**Source brief:** `teecloset/Tee_Closet_Claude_Code_Master_Prompt-1.md`

## 1. Goal

Build a premium, mobile-first fashion e-commerce marketing site for Tee Closet
(Kenyan clothing brand) that: sells the brand, drives WhatsApp/TikTok orders,
showcases the physical shop, and doubles as a portfolio piece demonstrating
professional frontend engineering. No checkout/payments — WhatsApp is the
order channel.

## 2. Project location & stack

- New project at `E:\qxai\teecloset\site`. Not related to, and does not reuse,
  `E:\qxai\app` (an unrelated trading-bot builder).
- React 19 + TypeScript + Vite + Tailwind CSS v4, `react-router-dom` v7,
  `zustand` v5 (wishlist only, persisted to `localStorage`).
- `E:\qxai\teecloset` becomes its own git repo (currently ungitted); the site
  lives in `site/`, this spec in `docs/superpowers/specs/`, brand image in
  `images/`.

## 3. Design tokens (from brand owner's exact spec — do not alter)

```css
--color-espresso: #171513;   /* Primary */
--color-champagne: #B89A72;  /* Signature accent — CTAs, badges, borders, active states */
--color-cream: #F7F3ED;      /* Main background */
--color-ivory: #FFFCF7;      /* Surface / cards */
--color-taupe: #8C7A68;      /* Secondary text */
--color-mocha: #3A3028;      /* Dark accent / dark-section background */
--color-sand: #DED3C4;       /* Borders */
```

Ratio: ~60% cream/ivory, 25% espresso/mocha, 10% champagne, 5% taupe.
No neon, no purple/blue gradients, no bright gold. Dark sections (e.g. footer,
"Why Tee Closet") reuse Mocha/Espresso + Ivory text rather than introducing
new colors. All tokens defined once in `src/styles/tokens.css` as CSS custom
properties, consumed through Tailwind theme extension — never hardcoded hex
in components.

**Typography:** serif display face for headings/logotype echoing the logo's
serif "TEE CLOSET" wordmark (e.g. a Playfair/Fraunces-style serif via
`@fontsource`), paired with a clean sans (Inter, already a dependency
elsewhere in this environment) for body/UI text. Logo tagline **"style.
confidence. you."** is the brand line, used in the hero and footer.

## 4. Brand assets

- Logo: `teecloset/images/file_0000000000d881f4875a0c49caacf42f (1).png`
  (TC monogram + hanger/blazer mark, Espresso/Champagne, ivory background) —
  copied into `site/src/assets/logo.png`.
- WhatsApp: `+254714713575` → wa.me id `254714713575`.
- TikTok: `https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW`
  (handle `@tee_closet019`).
- Shop location: Google Maps `https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac`,
  coordinates `-0.426654, 36.955100`. No address, landmark, or opening hours
  were provided — none are invented; the location section only shows the map
  link, coordinates, and a "Get Directions" button.

## 5. Routes

| Route | Purpose |
|---|---|
| `/` | Home — Hero, New Stock strip, Shop by Category, Featured picks, Why Tee Closet, Visit Our Store, TikTok/social section, WhatsApp CTA band, Footer |
| `/shop` | Full catalog with filter + sort (query-param driven) |
| `/product/:slug` | Product detail |
| `*` | Branded 404 |

Filters/sort live in URL search params (`?category=blazers&size=32&sort=newest`)
so filtered views are shareable and back/forward-navigable — no extra global
filter store needed.

## 6. Data model

`site/src/data/products.ts`:

```ts
type Category = 'wide-leg' | 'blazers' | 'tops' | 'official-pants' | 'chinos' | 'palazzo';
type Size = 26 | 28 | 30 | 32 | 34 | 36 | 38 | 40;
type Availability = 'in-stock' | 'limited' | 'sold';

interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  priceKsh: number;
  sizes: Size[];
  colors: string[];
  availability: Availability;
  isNew: boolean;
  isFeatured: boolean;
  description: string;
  stylingNote: string;
  images: string[]; // paths into src/assets/products
}

function getProducts(filters?: Partial<{ category, size, availability, sort }>): Product[];
function getProductBySlug(slug: string): Product | undefined;
function getRelatedProducts(product: Product): Product[];
```

~20 seed products spread across all 6 categories, sizes 26–40, realistic
varied KSh pricing (no single hard-coded universal price), a few flagged
`limited` or `sold` to exercise the one-off/limited-stock UI. All components
consume data only through `getProducts`/`getProductBySlug` — never import the
array directly — so a future backend (Supabase/Shopify/etc.) is a one-file
swap.

## 7. WhatsApp order flow

`buildWhatsAppOrderLink(product: Product, size?: Size): string` builds
`https://wa.me/254714713575?text=<encoded message>` containing product name,
size (if chosen), price, and the current page URL. Used on: product cards
(quick order), product detail page (primary CTA), and a persistent
mobile-bottom / desktop-header WhatsApp CTA. No account creation anywhere.

## 8. Wishlist

Small zustand store (`useWishlistStore`), persisted to `localStorage`,
holding an array of product ids. Toggled from the heart icon on product
cards/detail. No wishlist page in this round — YAGNI; the store is small
enough to extend with a `/wishlist` view later if requested.

## 9. Visit Our Store section

Exactly the content specified by the brand owner:
- "Visit Our Store" heading
- Short welcoming description (original copy, on-brand, no invented facts)
- "Get Directions" button linking to the Maps URL above
- Google Maps icon, coordinates shown
- Styled as a branded card (palette-consistent), not a raw iframe embed
- Mobile-friendly, no invented address/landmark/hours

## 10. Product photography

Before building the catalog UI, generate a consistent on-brand editorial
photo set using the image-generation tool available in this environment:
one hero lifestyle image plus 2–3 shots per category (wide-leg, blazers,
tops, official pants, chinos, palazzo) — styled to the Espresso/Champagne/
Cream palette, consistent lighting/background, so the site never looks like
a wireframe or generic stock site. Images saved into `site/src/assets/products/`
and referenced from the seed data. Structured so real photos can replace
them later with no code changes (same file paths / same `images: string[]`
shape).

## 11. Component architecture (high level)

```
src/
  components/
    layout/        Header, MobileNav, Footer, WhatsAppFloatingCTA
    product/        ProductCard, ProductGallery, SizePicker, AvailabilityBadge, WishlistButton
    shop/           FilterPanel (drawer on mobile), SortSelect, ActiveFilterChips
    home/           Hero, NewStockStrip, CategoryGrid, FeaturedGrid, WhyTeeCloset, VisitStore, SocialProof, WhatsAppBand
    ui/             Button, Badge, Skeleton, EmptyState (shared primitives)
  data/             products.ts, categories.ts
  lib/              whatsapp.ts, wishlistStore.ts, format.ts (KSh formatting)
  routes/           Home.tsx, Shop.tsx, ProductDetail.tsx, NotFound.tsx
  styles/           tokens.css
  assets/           logo.png, products/*
```

Each component has one clear responsibility and a typed props interface;
shared primitives (`ui/`) carry no business logic.

## 12. Non-functional requirements

- **Responsive:** small Android → large desktop; mobile bottom nav +
  floating WhatsApp CTA; touch targets ≥44px.
- **Performance:** lazy-loaded/responsive images, no unnecessary
  dependencies, code-split routes, avoid layout shift.
- **Accessibility:** semantic HTML, visible focus states, alt text on all
  product images, labeled form controls, sufficient contrast against the
  cream/ivory backgrounds.
- **SEO:** per-page titles/meta descriptions, Open Graph tags, product
  structured data (`schema.org/Product`) on detail pages, clean URLs.
- **States:** loading skeletons, empty states (e.g. no filter results),
  branded 404, error boundary for the product data layer.
- **Verification:** lint, typecheck, build, and actual browser inspection
  (desktop + mobile viewport) of every page before calling any phase done —
  not just "it compiles."

## 13. Out of scope this round

Real backend/CMS integration, checkout/payments, deployment/hosting. This
build is the complete frontend + mock data layer, structured so a backend
can be wired in later without a rewrite.
