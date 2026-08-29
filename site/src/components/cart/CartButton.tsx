import { useCartStore } from '@/lib/cartStore'

export function CartButton() {
  const itemCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0))
  const open = useCartStore((s) => s.open)

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? '' : 's'}` : ''}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-espresso"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-espresso">
          {itemCount}
        </span>
      )}
    </button>
  )
}
