import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h3 className="font-display text-xl text-espresso">{title}</h3>
      <p className="max-w-sm text-fg-muted">{description}</p>
      {action}
    </div>
  )
}
