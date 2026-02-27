import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function parseLocalizedInt(
  value: string | number | null | undefined,
  fallback: number
) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  const normalized = String(value ?? "")
    .trim()
    .replace(/[\u06F0-\u06F9]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0)
    )
    .replace(/[\u0660-\u0669]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660)
    )

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback
}
