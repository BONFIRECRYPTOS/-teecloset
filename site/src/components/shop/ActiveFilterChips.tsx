import { useCategories, getCategoryLabel } from '@/data/categories'
import type { ProductFilters } from '@/data/types'

interface ActiveFilterChipsProps {
  filters: ProductFilters
  onRemove: (key: keyof ProductFilters) => void
}

export function ActiveFilterChips({ filters, onRemove }: ActiveFilterChipsProps) {
  const { data: categories } = useCategories()
  const chips: { key: keyof ProductFilters; label: string }[] = []
  if (filters.category) chips.push({ key: 'category', label: getCategoryLabel(categories ?? [], filters.category) })
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
