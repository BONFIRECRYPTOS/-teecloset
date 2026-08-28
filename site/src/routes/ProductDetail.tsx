import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductBySlug, getRelatedProducts } from '@/data/products'
import { getCategoryLabel } from '@/data/categories'
import { formatKsh } from '@/lib/format'
import { buildWhatsAppOrderLink } from '@/lib/whatsapp'
import type { Size } from '@/data/types'
import { ProductGallery } from '@/components/product/ProductGallery'
import { SizePicker } from '@/components/product/SizePicker'
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/seo/Seo'
import { NotFound } from './NotFound'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? getProductBySlug(slug) : undefined
  const [selectedSize, setSelectedSize] = useState<Size | undefined>()

  if (!product) return <NotFound />

  const related = getRelatedProducts(product)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `/product/${product.slug}`
  const whatsAppLink = buildWhatsAppOrderLink(product, pageUrl, selectedSize)
  const isOrderable = product.availability !== 'sold'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Seo
        title={product.name}
        description={product.description}
        image={product.images[0]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'KES',
            price: product.priceKsh,
            availability:
              product.availability === 'in-stock'
                ? 'https://schema.org/InStock'
                : product.availability === 'limited'
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/SoldOut',
          },
        }}
      />
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-xs uppercase tracking-wider text-fg-muted">{getCategoryLabel(product.category)}</p>
          <h1 className="mt-1 font-display text-3xl text-espresso">{product.name}</h1>
          <p className="mt-2 text-xl font-semibold text-espresso">{formatKsh(product.priceKsh)}</p>

          <div className="mt-3 flex items-center gap-3">
            <AvailabilityBadge availability={product.availability} />
            <WishlistButton productId={product.id} />
          </div>

          <p className="mt-6 text-fg-muted">{product.description}</p>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Size</p>
            <div className="mt-2">
              <SizePicker sizes={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-sand bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">How to wear it</p>
            <p className="mt-1 text-sm text-espresso">{product.stylingNote}</p>
          </div>

          {isOrderable ? (
            <a href={whatsAppLink} target="_blank" rel="noreferrer" className="mt-6 block">
              <Button className="w-full">Order on WhatsApp</Button>
            </a>
          ) : (
            <Button className="mt-6 w-full" disabled>
              Sold Out
            </Button>
          )}

          <button
            type="button"
            onClick={() => navigator.share?.({ title: product.name, url: pageUrl })}
            className="mt-3 text-sm text-espresso underline"
          >
            Share this piece
          </button>

          <p className="mt-6 text-xs text-fg-muted">
            Sizes run true to Tee Closet's chart (26–40). Message us on WhatsApp before ordering if you're
            unsure of your fit — we're happy to help.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-espresso">You Might Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
