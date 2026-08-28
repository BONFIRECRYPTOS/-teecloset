import { Badge } from '@/components/ui/Badge'
import type { Availability } from '@/data/types'

const CONFIG: Record<Availability, { label: string; tone: 'accent' | 'neutral' | 'muted' }> = {
  'in-stock': { label: 'In Stock', tone: 'muted' },
  limited: { label: 'Limited Stock', tone: 'accent' },
  sold: { label: 'Sold Out', tone: 'neutral' },
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const { label, tone } = CONFIG[availability]
  return <Badge tone={tone}>{label}</Badge>
}
