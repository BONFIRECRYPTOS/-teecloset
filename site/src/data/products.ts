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
