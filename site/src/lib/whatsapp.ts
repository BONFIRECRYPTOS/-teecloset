import type { Product, Size } from '@/data/types'
import { formatKsh } from './format'
import { WHATSAPP_NUMBER } from './constants'

export function buildWhatsAppOrderLink(product: Product, pageUrl: string, size?: Size): string {
  const lines = [
    "Hi Tee Closet! I'd like to order:",
    product.name,
    size !== undefined ? `Size: ${size}` : null,
    `Price: ${formatKsh(product.priceKsh)}`,
    `Link: ${pageUrl}`,
  ].filter((line): line is string => line !== null)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}

export interface CartOrderLine {
  product: Product
  size: Size
  quantity: number
}

export function buildCartOrderLink(lines: CartOrderLine[], pageUrl: string): string {
  const itemLines = lines.map(
    (line, index) =>
      `${index + 1}. ${line.product.name} (Size ${line.size}) x${line.quantity} - ${formatKsh(
        line.product.priceKsh * line.quantity,
      )}`,
  )
  const total = lines.reduce((sum, line) => sum + line.product.priceKsh * line.quantity, 0)

  const message = [
    "Hi Tee Closet! I'd like to order:",
    '',
    ...itemLines,
    '',
    `Total: ${formatKsh(total)}`,
    `Link: ${pageUrl}`,
  ].join('\n')

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
