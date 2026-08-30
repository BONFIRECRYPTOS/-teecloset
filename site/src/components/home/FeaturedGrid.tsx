import { useProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function FeaturedGrid() {
  const { data, isLoading } = useProducts({ sort: 'popular' })
  const products = (data ?? []).filter((p) => p.isFeatured).slice(0, 8)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl text-espresso">Featured Picks</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Featured Picks</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
