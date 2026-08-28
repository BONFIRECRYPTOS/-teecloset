import { MAPS_URL, SHOP_COORDINATES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export function VisitStore() {
  return (
    <section id="visit-store" className="mx-auto max-w-6xl px-4 py-16">
      <div className="overflow-hidden rounded-2xl border border-sand bg-ivory p-8 md:p-12">
        <h2 className="font-display text-2xl text-espresso">Visit Our Store</h2>
        <p className="mt-3 max-w-lg text-fg-muted">
          Come see the pieces in person, try them on and get styled by the Tee Closet team.
        </p>
        <p className="mt-4 text-sm text-fg-muted">
          Coordinates: {SHOP_COORDINATES.lat}, {SHOP_COORDINATES.lng}
        </p>
        <a href={MAPS_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block">
          <Button>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            Get Directions
          </Button>
        </a>
      </div>
    </section>
  )
}
