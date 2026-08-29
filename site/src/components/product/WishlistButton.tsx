import { useWishlistStore } from '@/lib/wishlistStore'
import { cn } from '@/lib/cn'

export function WishlistButton({ productId }: { productId: string }) {
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId))
  const toggle = useWishlistStore((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        toggle(productId)
      }}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 text-espresso shadow',
        isWishlisted && 'text-champagne',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 21s-7.5-4.6-10-9.1C.6 8.8 2 5 5.6 5c2 0 3.4 1.1 4.4 2.6C11 6.1 12.4 5 14.4 5 18 5 19.4 8.8 22 11.9 19.5 16.4 12 21 12 21Z" />
      </svg>
    </button>
  )
}
