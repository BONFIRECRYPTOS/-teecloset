import type { Availability, Product, ProductFilters, Size } from './types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  product_images: { url: string; sort_order: number }[] | null
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
    images: [...(row.product_images ?? [])]
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

  return (data as unknown as ProductRow[]).map(mapRow)
}

export function useProducts(filters: ProductFilters = {}) {
  const { sort, ...serverFilters } = filters
  return useQuery({
    queryKey: ['products', serverFilters],
    queryFn: () => fetchProducts(serverFilters),
    select: (data) => sortProducts(data, sort),
    staleTime: 5 * 60 * 1000,
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
    mutationFn: async ({ orderedIds }: { productId: string; orderedIds: string[] }) => {
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
