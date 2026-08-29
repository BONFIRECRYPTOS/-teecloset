import { getProductBySlug } from '@/data/products'
import { formatKsh } from '@/lib/format'
import { useCartStore } from '@/lib/cartStore'
import { buildCartOrderLink } from '@/lib/whatsapp'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { cn } from '@/lib/cn'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const lines = items
    .map((item) => {
      const product = getProductBySlug(item.productSlug)
      return product ? { ...item, product } : null
    })
    .filter((line): line is NonNullable<typeof line> => line !== null)

  const total = lines.reduce((sum, line) => sum + line.product.priceKsh * line.quantity, 0)
  const pageUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const whatsAppLink = buildCartOrderLink(
    lines.map((line) => ({ product: line.product, size: line.size, quantity: line.quantity })),
    pageUrl,
  )

  return (
    <div
      className={cn('fixed inset-0 z-50 transition-opacity', isOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Dismiss cart overlay"
        onClick={close}
        className="absolute inset-0 bg-espresso/40"
      />
      <div
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-cream shadow-xl transition-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-sand px-4 py-4">
          <p className="font-display text-lg text-espresso">Your Cart</p>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center text-espresso"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <EmptyState title="Your cart is empty" description="Add pieces from the shop to build your order." />
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li key={`${line.productSlug}-${line.size}`} className="flex gap-3">
                  <ImageWithFallback
                    src={line.product.images[0]}
                    alt={line.product.name}
                    className="h-20 w-16 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-espresso">{line.product.name}</p>
                    <p className="text-xs text-fg-muted">Size {line.size}</p>
                    <p className="mt-1 text-sm font-semibold text-espresso">
                      {formatKsh(line.product.priceKsh * line.quantity)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.product.name}`}
                        onClick={() => updateQuantity(line.productSlug, line.size, line.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-sand text-espresso"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.product.name}`}
                        onClick={() => updateQuantity(line.productSlug, line.size, line.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-sand text-espresso"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${line.product.name} from cart`}
                        onClick={() => removeItem(line.productSlug, line.size)}
                        className="ml-auto text-xs text-fg-muted underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-sand px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-espresso">
              <span>Total</span>
              <span>{formatKsh(total)}</span>
            </div>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName('primary', 'w-full')}
            >
              Order on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
