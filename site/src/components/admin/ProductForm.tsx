import { useState, type FormEvent } from 'react'
import { useCategories } from '@/data/categories'
import type { Availability, Size } from '@/data/types'
import type { ProductInput } from '@/data/products'
import { Button } from '@/components/ui/Button'

const ALL_SIZES: Size[] = [26, 28, 30, 32, 34, 36, 38, 40]
const AVAILABILITIES: Availability[] = ['in-stock', 'limited', 'sold']

interface ProductFormProps {
  initialValues?: Partial<ProductInput>
  onSubmit: (input: ProductInput) => void | Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export function ProductForm({ initialValues, onSubmit, isSubmitting, submitLabel }: ProductFormProps) {
  const { data: categories } = useCategories()

  const [name, setName] = useState(initialValues?.name ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [priceKsh, setPriceKsh] = useState(initialValues?.priceKsh?.toString() ?? '')
  const [sizes, setSizes] = useState<Size[]>(initialValues?.sizes ?? [])
  const [colorsText, setColorsText] = useState((initialValues?.colors ?? []).join(', '))
  const [availability, setAvailability] = useState<Availability>(initialValues?.availability ?? 'in-stock')
  const [isNew, setIsNew] = useState(initialValues?.isNew ?? false)
  const [isFeatured, setIsFeatured] = useState(initialValues?.isFeatured ?? false)
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [stylingNote, setStylingNote] = useState(initialValues?.stylingNote ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)

  function toggleSize(size: Size) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b),
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError(null)

    const trimmedName = name.trim()
    const price = Number(priceKsh)
    const colors = colorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    if (!trimmedName) return setValidationError('Name is required.')
    if (!category) return setValidationError('Category is required.')
    if (!Number.isFinite(price) || price <= 0) return setValidationError('Price must be a positive number.')
    if (sizes.length === 0) return setValidationError('Select at least one size.')

    onSubmit({
      name: trimmedName,
      category,
      priceKsh: price,
      sizes,
      colors,
      availability,
      isNew,
      isFeatured,
      description: description.trim(),
      stylingNote: stylingNote.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <label htmlFor="product-name" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Name
        </label>
        <input
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <label htmlFor="product-category" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Category
        </label>
        <select
          id="product-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        >
          <option value="">Select a category</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="product-price" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Price (KSh)
        </label>
        <input
          id="product-price"
          type="number"
          min="0"
          value={priceKsh}
          onChange={(e) => setPriceKsh(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-sand">Sizes</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {ALL_SIZES.map((size) => (
            <label key={size} className="flex items-center gap-1 text-sm text-ivory">
              <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleSize(size)} />
              {size}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="product-colors" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Colors (comma-separated)
        </label>
        <input
          id="product-colors"
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <label htmlFor="product-availability" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Availability
        </label>
        <select
          id="product-availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as Availability)}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        >
          {AVAILABILITIES.map((a) => (
            <option key={a} value={a}>
              {a.replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> New
        </label>
        <label className="flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
        </label>
      </div>

      <div>
        <label htmlFor="product-description" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Description
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      <div>
        <label htmlFor="product-styling-note" className="text-xs font-semibold uppercase tracking-wider text-sand">
          Styling Note
        </label>
        <textarea
          id="product-styling-note"
          value={stylingNote}
          onChange={(e) => setStylingNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
      </div>

      {validationError && (
        <p role="alert" className="text-sm text-red-400">
          {validationError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
