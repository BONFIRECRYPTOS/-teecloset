import { useState } from 'react'
import { cn } from '@/lib/cn'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-sand to-cream text-espresso/30',
          className,
        )}
      >
        <span className="font-display text-2xl tracking-widest">TC</span>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} loading="lazy" className={className} onError={() => setFailed(true)} />
  )
}
