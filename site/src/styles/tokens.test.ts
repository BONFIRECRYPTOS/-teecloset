/// <reference types="node" />

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Use Node APIs only in this test file to read tokens.css as raw text.
// ?raw imports don't work with CSS in this Vite+Tailwind setup (CSS pipeline
// transforms the file before ?raw can extract it), so we read the file directly.
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
