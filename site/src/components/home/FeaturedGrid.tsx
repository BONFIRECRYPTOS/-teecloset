import { getProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'

export function FeaturedGrid() {
  const products = getProducts({ sort: 'popular' })
    .filter((p) => p.isFeatured)
    .slice(0, 8)

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
