import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-sand/40">
        <ImageWithFallback src={images[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                'h-16 w-16 overflow-hidden rounded-md border',
                active === i ? 'border-espresso' : 'border-sand',
              )}
            >
              <ImageWithFallback src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
