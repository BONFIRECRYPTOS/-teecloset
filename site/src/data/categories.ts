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
