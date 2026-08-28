import { buildGeneralWhatsAppLink } from '@/lib/constants'

export function WhatsAppFloatingCTA() {
  return (
    <a
      href={buildGeneralWhatsAppLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Tee Closet on WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-champagne text-espresso shadow-lg transition-transform hover:scale-105 md:bottom-6"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.93A9.86 9.86 0 0 0 12.04 2Zm5.8 14.19c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.66-.6-2.93-1.27-4.84-4.2-4.99-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.46.77-2.17 1.04-2.47.27-.29.6-.36.8-.36h.57c.18 0 .43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.6 2 1.1.98 2.03 1.28 2.32 1.43.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.2-.29.4-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.75-.17 1.43Z" />
      </svg>
    </a>
  )
}
