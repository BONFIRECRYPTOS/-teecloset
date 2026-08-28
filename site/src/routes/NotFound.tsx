import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-6xl text-champagne">404</p>
      <h1 className="font-display text-2xl text-espresso">This piece isn't in our closet</h1>
      <p className="text-fg-muted">The page you're looking for may have sold out or moved.</p>
      <Link to="/">
        <Button>Back to Shopping</Button>
      </Link>
    </div>
  )
}
