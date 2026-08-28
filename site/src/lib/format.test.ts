import { describe, expect, it } from 'vitest'
import { formatKsh } from './format'

describe('formatKsh', () => {
  it('formats with the KSh prefix and thousands separators', () => {
    expect(formatKsh(2800)).toBe('KSh 2,800')
    expect(formatKsh(1200)).toBe('KSh 1,200')
    expect(formatKsh(35000)).toBe('KSh 35,000')
  })

  it('rounds fractional amounts', () => {
    expect(formatKsh(1999.6)).toBe('KSh 2,000')
  })
})
