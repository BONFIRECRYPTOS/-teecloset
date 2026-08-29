import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
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
    if (!existsSync(filePath)) {
      console.warn(`Skipping missing file: ${file}`)
      continue
    }
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
    const { error: delError } = await supabase.from('product_images').delete().eq('product_id', inserted.id)
    if (delError) throw delError

    const imagesToInsert = []
    if (imageUrls[img1]) {
      imagesToInsert.push({ product_id: inserted.id, url: imageUrls[img1], sort_order: 0 })
    }
    if (imageUrls[img2]) {
      imagesToInsert.push({ product_id: inserted.id, url: imageUrls[img2], sort_order: imagesToInsert.length })
    }

    if (imagesToInsert.length > 0) {
      const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert)
      if (imgError) throw imgError
    }
  }

  console.log(`Done. Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
