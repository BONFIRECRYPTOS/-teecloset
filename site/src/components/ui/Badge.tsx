import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'accent' | 'neutral' | 'muted'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  accent: 'bg-champagne text-espresso',
  neutral: 'bg-espresso text-ivory',
  muted: 'bg-sand text-espresso',
}

export function Badge({ tone = 'accent', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
