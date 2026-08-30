import { Link } from 'react-router-dom'
import { useCategories } from '@/data/categories'
import { useProducts } from '@/data/products'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Skeleton } from '@/components/ui/Skeleton'

export function CategoryGrid() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: products, isLoading: productsLoading } = useProducts()

  const coverByCategory = new Map<string, string>()
  for (const product of products ?? []) {
    if (!coverByCategory.has(product.category) && product.images[0]) {
      coverByCategory.set(product.category, product.images[0])
    }
  }

  const isLoading = categoriesLoading || productsLoading

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))
          : (categories ?? []).map((category) => {
              const cover = coverByCategory.get(category.slug)
              return (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-sand/40"
                >
                  {cover && (
                    <ImageWithFallback
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-espresso/70 px-3 py-2 text-sm font-medium text-ivory">
                    {category.label}
                  </span>
                </Link>
              )
            })}
      </div>
    </section>
  )
}
