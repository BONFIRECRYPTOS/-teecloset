import { TIKTOK_HANDLE, TIKTOK_URL } from '@/lib/constants'

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h2 className="font-display text-2xl text-espresso">Seen on TikTok</h2>
      <p className="mx-auto mt-3 max-w-md text-fg-muted">
        Follow {TIKTOK_HANDLE} for new stock drops, styling ideas and behind-the-scenes at Tee Closet.
      </p>
      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-espresso px-6 py-3 text-sm font-medium text-espresso hover:bg-espresso hover:text-ivory"
      >
        Follow on TikTok
      </a>
    </section>
  )
}
