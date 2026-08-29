import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-espresso text-ivory hover:bg-mocha',
  secondary: 'bg-champagne text-espresso hover:brightness-95',
  ghost: 'bg-transparent text-espresso border border-sand hover:bg-sand/30',
}

/**
 * Returns the Button component's visual class list so a non-button element
 * (e.g. an `<a>`) can be styled to look like a Button without nesting a real
 * `<button>` inside another interactive element such as an anchor — invalid
 * per the HTML5 content model and confusing for the accessibility tree.
 */
export function buttonClassName(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)
}
