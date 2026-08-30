import type { Product, ProductFilters } from './types'
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
