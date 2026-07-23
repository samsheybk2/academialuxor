export function parseDurationToMinutes(value: string): number {
  if (!value) return 0

  if (value.includes(":")) {
    const parts = value.split(":")
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    return hours * 60 + minutes
  }

  const num = parseInt(value.replace(/\D/g, ""))
  return isNaN(num) ? 0 : num
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  if (totalMinutes <= 0) return "00:00"
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function formatDuration(value: string): string {
  const minutes = parseDurationToMinutes(value)
  return formatMinutesToHHMM(minutes)
}
