import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductById, useCreateProduct, useUpdateProduct, type ProductInput } from '@/data/products'
import { ProductForm } from '@/components/admin/ProductForm'
import { ProductImageManager } from '@/components/admin/ProductImageManager'

export function AdminProductForm() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id
  const navigate = useNavigate()

  const { data: existingProduct, isLoading } = useProductById(id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  async function handleSubmit(input: ProductInput) {
    setSubmitError(null)
    try {
      if (isEditMode && id) {
        await updateProduct.mutateAsync({ id, ...input })
        navigate('/admin')
      } else {
        const created = await createProduct.mutateAsync(input)
        setCreatedId(created.id)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product.')
    }
  }

  if (isEditMode && isLoading) {
    return <p className="text-sand">Loading…</p>
  }

  if (isEditMode && !existingProduct) {
    return <p className="text-red-400">Product not found.</p>
  }

  const activeProductId = isEditMode ? id! : createdId

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>

      <ProductForm
        initialValues={existingProduct ?? undefined}
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
        submitLabel={isEditMode ? 'Save Changes' : 'Create Product'}
      />

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {submitError}
        </p>
      )}

      {activeProductId ? (
        <ProductImageManager productId={activeProductId} />
      ) : (
        <p className="mt-6 text-sm text-sand">Save the product first to add photos.</p>
      )}

      {!isEditMode && createdId && (
        <button type="button" onClick={() => navigate('/admin')} className="mt-6 text-champagne underline">
          Done — back to dashboard
        </button>
      )}
    </div>
  )
}
