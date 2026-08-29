import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  image?: string
  structuredData?: Record<string, unknown>
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function Seo({ title, description, image, structuredData }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | Tee Closet`
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    if (image) {
      upsertMeta('property', 'og:image', image)
    } else {
      document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.remove()
    }

    let script: HTMLScriptElement | null = null
    if (structuredData) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    return () => {
      if (script) document.head.removeChild(script)
    }
  }, [title, description, image, structuredData])

  return null
}
