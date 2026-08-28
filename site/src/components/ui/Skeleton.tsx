import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-sand/60', className)}
      role="status"
      aria-label="Loading"
    />
  )
}
