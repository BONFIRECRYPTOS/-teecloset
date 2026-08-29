import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/data/categories'
import { getProducts } from '@/data/products'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl text-espresso">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {CATEGORIES.map((category) => {
          const cover = getProducts({ category: category.slug })[0]?.images[0]
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
