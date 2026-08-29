import { Link } from 'react-router-dom'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { Seo } from '@/components/seo/Seo'

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <Seo title="Page Not Found" description="This page could not be found." />
      <p className="font-display text-6xl text-mocha">404</p>
      <h1 className="font-display text-2xl text-espresso">This piece isn't in our closet</h1>
      <p className="text-fg-muted">The page you're looking for may have sold out or moved.</p>
      <Link to="/" className={buttonClassName()}>
        Back to Shopping
      </Link>
    </div>
  )
}
