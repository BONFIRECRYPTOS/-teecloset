import { useCategories } from '@/data/categories'
import type { Availability, ProductFilters, Size } from '@/data/types'
import { cn } from '@/lib/cn'

const SIZES: Size[] = [26, 28, 30, 32, 34, 36, 38, 40]
const AVAILABILITIES: Availability[] = ['in-stock', 'limited', 'sold']

interface FilterPanelProps {
  filters: ProductFilters
  onChange: (filters: ProductFilters) => void
  isOpen: boolean
  onClose: () => void
}

export function FilterPanel({ filters, onChange, isOpen, onClose }: FilterPanelProps) {
  const { data: categories } = useCategories()
  return (
    <aside
      className={cn(
        'fixed inset-0 z-50 overflow-y-auto bg-cream p-6 md:static md:z-auto md:block md:w-56 md:bg-transparent md:p-0',
        isOpen ? 'block' : 'hidden',
      )}
    >
      <div className="flex items-center justify-between md:hidden">
        <p className="font-display text-lg">Filters</p>
        <button type="button" onClick={onClose} aria-label="Close filters" className="text-espresso">
          Close
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Category</p>
          <div className="mt-2 flex flex-col gap-1">
            {(categories ?? []).map((category) => (
              <label key={category.slug} className="flex items-center gap-2 text-sm text-espresso">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.slug}
                  onChange={() => onChange({ ...filters, category: category.slug })}
                />
                {category.label}
              </label>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...filters, category: undefined })}
              className="mt-1 self-start text-xs text-mocha underline"
            >
              Clear category
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={filters.size === size}
                onClick={() => onChange({ ...filters, size: filters.size === size ? undefined : size })}
                className={cn(
                  'h-11 w-11 rounded-full border text-sm',
                  filters.size === size ? 'border-espresso bg-espresso text-ivory' : 'border-sand text-espresso',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Availability</p>
          <div className="mt-2 flex flex-col gap-1">
            {AVAILABILITIES.map((availability) => (
              <label key={availability} className="flex items-center gap-2 text-sm capitalize text-espresso">
                <input
                  type="radio"
                  name="availability"
                  checked={filters.availability === availability}
                  onChange={() => onChange({ ...filters, availability })}
                />
                {availability.replace('-', ' ')}
              </label>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...filters, availability: undefined })}
              className="mt-1 self-start text-xs text-mocha underline"
            >
              Clear availability
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
