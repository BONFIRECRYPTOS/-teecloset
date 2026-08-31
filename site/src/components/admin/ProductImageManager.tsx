import { useRef, useState } from 'react'
import {
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useReorderProductImages,
} from '@/data/products'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonClassName } from '@/components/ui/buttonStyles'

interface ProductImageManagerProps {
  productId: string
}

export function ProductImageManager({ productId }: ProductImageManagerProps) {
  const { data: images, isLoading } = useProductImages(productId)
  const uploadImage = useUploadProductImage()
  const deleteImage = useDeleteProductImage()
  const reorderImages = useReorderProductImages()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setIsUploading(true)
    try {
      const startingOrder = images?.length ?? 0
      for (let i = 0; i < files.length; i += 1) {
        await uploadImage.mutateAsync({ productId, file: files[i], sortOrder: startingOrder + i })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemove(imageId: string) {
    setError(null)
    try {
      await deleteImage.mutateAsync({ imageId, productId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo.')
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    if (!images) return
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setError(null)
    try {
      await reorderImages.mutateAsync({ productId, orderedIds: reordered.map((img) => img.id) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder photos.')
    }
  }

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-sand">Photos</p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-2 flex gap-3">
          <Skeleton className="h-24 w-20" />
          <Skeleton className="h-24 w-20" />
        </div>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-3">
          {(images ?? []).map((image, index) => (
            <li key={image.id} className="flex flex-col items-center gap-1">
              <img
                src={image.url}
                alt={`Product photo ${index + 1}`}
                className="h-24 w-20 rounded-md object-cover"
              />
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move photo left"
                  className="text-sand underline disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === (images?.length ?? 0) - 1}
                  aria-label="Move photo right"
                  className="text-sand underline disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  aria-label="Remove photo"
                  className="text-red-400 underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className={buttonClassName('secondary', 'mt-4 inline-flex cursor-pointer')}>
        {isUploading ? 'Uploading…' : 'Add Photos'}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
