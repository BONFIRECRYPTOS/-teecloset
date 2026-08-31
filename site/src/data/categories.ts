import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export interface CategoryInput {
  slug: string
  label: string
  sortOrder: number
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { error } = await supabase
        .from('categories')
        .insert({ slug: input.slug, label: input.label, sort_order: input.sortOrder })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; label: string }) => {
      const { error } = await supabase.from('categories').update({ label: input.label }).eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: { id: string; slug: string }) => {
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category', category.slug)
      if (countError) throw countError
      if (count && count > 0) {
        throw new Error(
          `Can't delete "${category.slug}" — ${count} product${count === 1 ? '' : 's'} still use${count === 1 ? 's' : ''} this category.`,
        )
      }
      const { error } = await supabase.from('categories').delete().eq('id', category.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
