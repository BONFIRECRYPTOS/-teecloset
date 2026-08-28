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
