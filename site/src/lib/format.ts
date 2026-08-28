export function formatKsh(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(Math.round(amount))
  return `KSh ${formatted}`
}
