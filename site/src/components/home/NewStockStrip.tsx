import { useProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function NewStockStrip() {
  const { data, isLoading } = useProducts({ sort: 'newest' })
  const products = (data ?? []).filter((p) => p.isNew).slice(0, 8)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl text-espresso">New Stock</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-44 flex-shrink-0 md:w-56" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">New Stock</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-44 flex-shrink-0 md:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
