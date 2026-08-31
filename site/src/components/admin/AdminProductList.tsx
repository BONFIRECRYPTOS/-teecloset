import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/data/products'
import { useCategories, getCategoryLabel } from '@/data/categories'
import { formatKsh } from '@/lib/format'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'

export function AdminProductList() {
  const { data: products, isLoading, isError } = useProducts()
  const { data: categories } = useCategories()
  const deleteProduct = useDeleteProduct()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleteError(null)
    setDeletingId(id)
    try {
      await deleteProduct.mutateAsync(id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Products</h2>
        <Link to="/admin/products/new" className={buttonClassName('secondary')}>
          Add Product
        </Link>
      </div>

      {deleteError && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {deleteError}
        </p>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-4 text-red-400">Couldn't load products.</p>
      ) : (products ?? []).length === 0 ? (
        <p className="mt-4 text-sand">No products yet.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-taupe text-sand">
              <th className="py-2 font-medium">Name</th>
              <th className="font-medium">Category</th>
              <th className="font-medium">Price</th>
              <th className="font-medium">Availability</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products!.map((product) => (
              <tr key={product.id} className="border-b border-taupe/40">
                <td className="py-2">{product.name}</td>
                <td>{getCategoryLabel(categories ?? [], product.category)}</td>
                <td>{formatKsh(product.priceKsh)}</td>
                <td className="capitalize">{product.availability.replace('-', ' ')}</td>
                <td className="text-right">
                  <Link to={`/admin/products/${product.id}/edit`} className="text-champagne underline">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="ml-4 text-red-400 underline disabled:opacity-50"
                  >
                    {deletingId === product.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
