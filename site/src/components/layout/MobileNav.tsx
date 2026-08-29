import { Link } from 'react-router-dom'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-sand bg-ivory py-2 md:hidden"
    >
      <Link
        to="/"
        className="flex min-h-11 flex-col items-center justify-center gap-1 px-4 text-xs text-espresso"
      >
        Home
      </Link>
      <Link
        to="/shop"
        className="flex min-h-11 flex-col items-center justify-center gap-1 px-4 text-xs text-espresso"
      >
        Shop
      </Link>
      <a
        href={buildGeneralWhatsAppLink()}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-full bg-champagne px-4 text-xs font-medium text-espresso"
      >
        WhatsApp
      </a>
    </nav>
  )
}
