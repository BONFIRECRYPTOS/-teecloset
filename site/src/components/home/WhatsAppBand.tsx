import { buttonClassName } from '@/components/ui/buttonStyles'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function WhatsAppBand() {
  return (
    <section className="bg-champagne py-12 text-center">
      <h2 className="font-display text-2xl text-espresso">Ready to shop the vibe?</h2>
      <p className="mt-2 text-espresso/80">Message us on WhatsApp — we'll help you find your size and style.</p>
      <a
        href={buildGeneralWhatsAppLink()}
        target="_blank"
        rel="noreferrer"
        className={buttonClassName('primary', 'mt-6')}
      >
        Order on WhatsApp
      </a>
    </section>
  )
}
