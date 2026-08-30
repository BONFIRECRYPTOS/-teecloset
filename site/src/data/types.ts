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
