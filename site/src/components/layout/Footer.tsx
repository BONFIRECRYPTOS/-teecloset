import { Link } from 'react-router-dom'
import { BRAND_TAGLINE, TIKTOK_HANDLE, TIKTOK_URL, buildGeneralWhatsAppLink } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="mt-16 bg-mocha pb-20 pt-12 text-ivory md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:justify-between">
        <div>
          <span className="font-display text-xl font-semibold">Tee Closet</span>
          <p className="mt-2 max-w-xs text-sm text-ivory/70">{BRAND_TAGLINE}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          <Link to="/" className="hover:text-champagne">Home</Link>
          <Link to="/shop" className="hover:text-champagne">Shop</Link>
          <Link to="/#visit-store" className="hover:text-champagne">Visit Us</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="hover:text-champagne">
            TikTok {TIKTOK_HANDLE}
          </a>
          <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer" className="hover:text-champagne">
            WhatsApp us
          </a>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Tee Closet. All rights reserved.
      </p>
    </footer>
  )
}
