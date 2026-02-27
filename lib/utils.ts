import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const jalaliDateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  calendar: "persian",
})

const jalaliDateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  calendar: "persian",
})

const jalaliTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  hour: "2-digit",
  minute: "2-digit",
  calendar: "persian",
})

/**
 * Formats a date string or Date to Jalali (Persian) calendar.
 * Accepts ISO strings, "yyyy-MM-dd" strings, or Date objects.
 * Returns the fallback if the input is falsy or invalid.
 */
export function toJalali(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return fallback
  return jalaliDateFormatter.format(date)
}

export function toJalaliDateTime(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return fallback
  return jalaliDateTimeFormatter.format(date)
}

export function toJalaliTime(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return fallback
  return jalaliTimeFormatter.format(date)
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
