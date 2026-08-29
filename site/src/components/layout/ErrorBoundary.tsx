import { Component, type ReactNode } from 'react'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { buildGeneralWhatsAppLink } from '@/lib/constants'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
          <h1 className="font-display text-2xl text-espresso">Something went wrong</h1>
          <p className="text-fg-muted">
            We couldn't load this page. Please refresh, or message us on WhatsApp if it keeps happening.
          </p>
          <a href={buildGeneralWhatsAppLink()} target="_blank" rel="noreferrer" className={buttonClassName()}>
            Message Us on WhatsApp
          </a>
        </div>
      )
    }

    return this.props.children
  }
}
