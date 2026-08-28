import type { Product, Size } from '@/data/types'
import { formatKsh } from './format'

const WHATSAPP_NUMBER = '254714713575'

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
