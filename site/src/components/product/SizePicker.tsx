import type { Size } from '@/data/types'
import { cn } from '@/lib/cn'

interface SizePickerProps {
  sizes: Size[]
  selected?: Size
  onSelect: (size: Size) => void
}

export function SizePicker({ sizes, selected, onSelect }: SizePickerProps) {
  return (
    <div role="group" aria-label="Select size" className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={selected === size}
          onClick={() => onSelect(size)}
          className={cn(
            'h-11 w-11 rounded-full border text-sm font-medium transition-colors',
            selected === size
              ? 'border-espresso bg-espresso text-ivory'
              : 'border-sand text-espresso hover:border-espresso',
          )}
        >
          {size}
        </button>
      ))}
    </div>
  )
}
