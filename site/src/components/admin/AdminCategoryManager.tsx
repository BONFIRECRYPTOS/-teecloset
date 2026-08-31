import { useState, type FormEvent } from 'react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/data/categories'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AdminCategoryManager() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const label = newLabel.trim()
    if (!label) return
    try {
      await createCategory.mutateAsync({
        slug: slugify(label),
        label,
        sortOrder: categories?.length ?? 0,
      })
      setNewLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category.')
    }
  }

  function startEditing(id: string, currentLabel: string) {
    setEditingId(id)
    setEditingLabel(currentLabel)
    setError(null)
  }

  async function handleRename(id: string) {
    setError(null)
    try {
      await updateCategory.mutateAsync({ id, label: editingLabel.trim() })
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename category.')
    }
  }

  async function handleDelete(id: string, slug: string, label: string) {
    if (!window.confirm(`Delete "${label}"?`)) return
    setError(null)
    try {
      await deleteCategory.mutateAsync({ id, slug })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl">Categories</h2>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {(categories ?? []).map((category) => (
            <li key={category.id} className="flex items-center gap-3 rounded-md border border-taupe/60 px-3 py-2">
              {editingId === category.id ? (
                <>
                  <input
                    aria-label={`Rename ${category.label}`}
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    className="flex-1 rounded-md border border-taupe bg-mocha px-2 py-1 text-ivory"
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(category.id)}
                    className="text-champagne underline"
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-sand underline">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{category.label}</span>
                  <button
                    type="button"
                    onClick={() => startEditing(category.id, category.label)}
                    className="text-champagne underline"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id, category.slug, category.label)}
                    className="text-red-400 underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="mt-4 flex gap-2">
        <input
          aria-label="New category name"
          placeholder="New category name"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 rounded-md border border-taupe bg-mocha px-3 py-2 text-ivory"
        />
        <button type="submit" className={buttonClassName('secondary')} disabled={createCategory.isPending}>
          Add
        </button>
      </form>
    </div>
  )
}
