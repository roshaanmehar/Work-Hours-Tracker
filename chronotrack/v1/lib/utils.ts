import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return (end - start) / (1000 * 60 * 60) // Convert to hours
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export function formatMoney(amount: number): string {
  return `£${amount.toFixed(2)}`
}
