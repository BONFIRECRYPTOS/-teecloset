import { Link } from 'react-router-dom'
import type { Product } from '@/data/types'
import { formatKsh } from '@/lib/format'
import { getCategoryLabel } from '@/data/categories'
import { buildWhatsAppOrderLink } from '@/lib/whatsapp'
import { Badge } from '@/components/ui/Badge'
import { AvailabilityBadge } from './AvailabilityBadge'
import { WishlistButton } from './WishlistButton'

export function ProductCard({ product }: { product: Product }) {
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/product/${product.slug}`
      : `/product/${product.slug}`

  return (
    <div className="group relative">
      <Link to={`/product/${product.slug}`} aria-label={product.name} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-sand/40">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.isNew && (
            <div className="absolute left-2 top-2">
              <Badge tone="accent">New</Badge>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-espresso">{product.name}</p>
            <p className="text-xs text-fg-muted">{getCategoryLabel(product.category)}</p>
          </div>
          <p className="text-sm font-semibold text-espresso">{formatKsh(product.priceKsh)}</p>
        </div>
        <div className="mt-1">
          <AvailabilityBadge availability={product.availability} />
        </div>
      </Link>

      <div className="absolute right-2 top-2 flex flex-col gap-2">
        <WishlistButton productId={product.id} />
        {product.availability !== 'sold' && (
          <a
            href={buildWhatsAppOrderLink(product, productUrl)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne text-espresso shadow"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.93A9.86 9.86 0 0 0 12.04 2Zm5.8 14.19c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.66-.6-2.93-1.27-4.84-4.2-4.99-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.46.77-2.17 1.04-2.47.27-.29.6-.36.8-.36h.57c.18 0 .43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.6 2 1.1.98 2.03 1.28 2.32 1.43.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.2-.29.4-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.75-.17 1.43Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
