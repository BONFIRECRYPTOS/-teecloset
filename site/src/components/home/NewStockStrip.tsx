import { getProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'

export function NewStockStrip() {
  const products = getProducts({ sort: 'newest' })
    .filter((p) => p.isNew)
    .slice(0, 8)

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
