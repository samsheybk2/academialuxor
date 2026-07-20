/**
 * Utilidades para manejo de fechas en zona horaria de Caracas, Venezuela (UTC-4)
 */

const TIMEZONE = "America/Caracas"

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-VE", {
    timeZone: TIMEZONE,
    ...options,
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-VE", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("es-VE", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getCaracasDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }))
}

export function getCaracasISOString(): string {
  const now = new Date()
  const caracasTime = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }))
  return caracasTime.toISOString()
}
