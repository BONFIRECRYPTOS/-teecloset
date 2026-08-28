import { Button } from '@/components/ui/Button'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function WhatsAppBand() {
  return (
    <section className="bg-champagne py-12 text-center">
      <h2 className="font-display text-2xl text-espresso">Ready to shop the vibe?</h2>
      <p className="mt-2 text-espresso/80">Message us on WhatsApp — we'll help you find your size and style.</p>
      <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer" className="mt-6 inline-block">
        <Button variant="primary">Order on WhatsApp</Button>
      </a>
    </section>
  )
}
