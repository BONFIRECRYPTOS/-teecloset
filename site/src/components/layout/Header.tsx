import { Link } from 'react-router-dom'
import { buildGeneralWhatsAppLink } from '@/lib/constants'
import { CartButton } from '@/components/cart/CartButton'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Tee Closet" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-semibold text-espresso">Tee Closet</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <Link to="/" className="text-sm font-medium text-espresso hover:text-mocha">
            Home
          </Link>
          <Link to="/shop" className="text-sm font-medium text-espresso hover:text-mocha">
            Shop
          </Link>
          <Link to="/#visit-store" className="text-sm font-medium text-espresso hover:text-mocha">
            Visit Us
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <CartButton />
          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-espresso px-5 py-2 text-sm font-medium text-ivory hover:bg-mocha md:inline-flex"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </header>
  )
}
