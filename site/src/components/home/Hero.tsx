import { Link } from 'react-router-dom'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { BRAND_TAGLINE, buildGeneralWhatsAppLink } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-espresso text-ivory">
      <img
        src="/products/hero.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 md:py-32">
        <p className="text-sm uppercase tracking-[0.3em] text-champagne">{BRAND_TAGLINE}</p>
        <h1 className="max-w-lg font-display text-4xl leading-tight md:text-6xl">
          Dress with confidence. Shop the Tee Closet vibe.
        </h1>
        <p className="max-w-md text-ivory/80">
          Premium wide-legs, blazers, tops and more — new stock dropping regularly, straight to your WhatsApp.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/shop" className={buttonClassName('secondary')}>
            Shop New Stock
          </Link>
          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName('ghost', 'border-ivory/40 text-ivory hover:bg-ivory/10')}
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
