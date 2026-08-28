import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Note: import.meta.url is not a valid file:// URL in this Vitest+jsdom setup,
// causing "The URL must be of scheme file" error, so we use import.meta.dirname instead.
const css = readFileSync(join(import.meta.dirname, './tokens.css'), 'utf-8')

describe('brand tokens', () => {
  it.each([
    ['--color-espresso', '#171513'],
    ['--color-champagne', '#B89A72'],
    ['--color-cream', '#F7F3ED'],
    ['--color-ivory', '#FFFCF7'],
    ['--color-taupe', '#8C7A68'],
    ['--color-mocha', '#3A3028'],
    ['--color-sand', '#DED3C4'],
  ])('defines %s as %s', (name, value) => {
    expect(css).toContain(`${name}: ${value}`)
  })
})
