import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { WhatsAppFloatingCTA } from './WhatsAppFloatingCTA'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-espresso">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppFloatingCTA />
    </div>
  )
}
