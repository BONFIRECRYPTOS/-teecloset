import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/data/products'
import type { CategorySlug, ProductFilters, Size, SortOption } from '@/data/types'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { FilterPanel } from '@/components/shop/FilterPanel'
import { SortSelect } from '@/components/shop/SortSelect'
import { ActiveFilterChips } from '@/components/shop/ActiveFilterChips'
import { Seo } from '@/components/seo/Seo'

function parseFilters(params: URLSearchParams): ProductFilters {
  const category = params.get('category') as CategorySlug | null
  const size = params.get('size')
  const availability = params.get('availability') as ProductFilters['availability'] | null
  const sort = (params.get('sort') as SortOption | null) ?? 'newest'

  return {
    category: category ?? undefined,
    size: size ? (Number(size) as Size) : undefined,
    availability: availability ?? undefined,
    sort,
  }
}

function toSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.size) params.set('size', String(filters.size))
  if (filters.availability) params.set('availability', filters.availability)
  if (filters.sort) params.set('sort', filters.sort)
  return params
}

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setFilterOpen] = useState(false)
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const { data: products, isLoading, isError } = useProducts(filters)
  const count = products?.length ?? 0

  const updateFilters = (next: ProductFilters) => setSearchParams(toSearchParams(next))
  const removeFilter = (key: keyof ProductFilters) => updateFilters({ ...filters, [key]: undefined })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Seo
        title="Shop All"
        description="Browse Tee Closet's full catalogue — wide-leg pants, blazers, tops, official pants, chinos and palazzo pants. Filter by size, category and availability."
      />
      <h1 className="font-display text-3xl text-espresso">Shop All</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {isLoading ? 'Loading…' : `${count} piece${count === 1 ? '' : 's'}`}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4 md:hidden">
        <Button variant="ghost" onClick={() => setFilterOpen(true)}>
          Filters
        </Button>
        <SortSelect value={filters.sort ?? 'newest'} onChange={(sort) => updateFilters({ ...filters, sort })} />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[14rem_1fr]">
        <FilterPanel
          filters={filters}
          onChange={updateFilters}
          isOpen={isFilterOpen}
          onClose={() => setFilterOpen(false)}
        />

        <div>
          <div className="hidden items-center justify-between md:flex">
            <ActiveFilterChips filters={filters} onRemove={removeFilter} />
            <SortSelect value={filters.sort ?? 'newest'} onChange={(sort) => updateFilters({ ...filters, sort })} />
          </div>

          <div className="mt-4 md:hidden">
            <ActiveFilterChips filters={filters} onRemove={removeFilter} />
          </div>

          {isLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Couldn't load products"
              description="Something went wrong loading the catalogue. Please try again shortly."
            />
          ) : count === 0 ? (
            <EmptyState
              title="No pieces match those filters"
              description="Try clearing a filter or check back — new stock drops regularly."
              action={
                <Button variant="ghost" onClick={() => updateFilters({})}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products!.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
