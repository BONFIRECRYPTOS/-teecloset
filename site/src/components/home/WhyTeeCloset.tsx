const REASONS = [
  { title: 'Tailored Quality', body: 'Every piece is chosen for fit, fabric and finish — fashion that actually lasts.' },
  { title: 'Made for You', body: 'Sizes 26–40, styled for real life in Kenya — from the office to a night out.' },
  { title: 'Shop on WhatsApp', body: 'No accounts, no forms. Message us and we sort you out directly.' },
  { title: 'Limited Drops', body: 'Many pieces are one-off — when it is gone, a new favourite takes its place.' },
]

export function WhyTeeCloset() {
  return (
    <section className="bg-mocha py-16 text-ivory">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl">Why Tee Closet</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.title}>
              <p className="font-display text-lg text-champagne">{reason.title}</p>
              <p className="mt-2 text-sm text-ivory/75">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
