export const EASTERN_TIME_ZONE = 'America/New_York'
export const EASTERN_TIME_LABEL = 'ET'

const easternDateKeyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const easternDayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const easternDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

function parseTimestamp(timestamp?: string): Date | null {
  if (!timestamp) return null

  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value ?? ''
}

export function getEasternDateKey(timestamp?: string): string | null {
  const date = parseTimestamp(timestamp)
  if (!date) return null

  const parts = easternDateKeyFormatter.formatToParts(date)
  const year = getPart(parts, 'year')
  const month = getPart(parts, 'month')
  const day = getPart(parts, 'day')

  return year && month && day ? `${year}-${month}-${day}` : null
}

export function formatEasternDayLabel(dateKey?: string | null, fallback = 'No dated matches'): string {
  if (!dateKey) return fallback

  const date = parseTimestamp(`${dateKey}T12:00:00Z`)
  if (!date) return fallback

  return `${easternDayLabelFormatter.format(date)} ${EASTERN_TIME_LABEL}`
}

export function formatEasternDateTime(timestamp?: string, fallback = 'Time TBD'): string {
  const date = parseTimestamp(timestamp)
  if (!date) return fallback

  const parts = easternDateTimeFormatter.formatToParts(date)
  const month = getPart(parts, 'month')
  const day = getPart(parts, 'day')
  const year = getPart(parts, 'year')
  const hour = getPart(parts, 'hour')
  const minute = getPart(parts, 'minute')
  const dayPeriod = getPart(parts, 'dayPeriod')

  if (!month || !day || !year || !hour || !minute || !dayPeriod) {
    return `${easternDateTimeFormatter.format(date)} ${EASTERN_TIME_LABEL}`
  }

  return `${month} ${day}, ${year}, ${hour}:${minute} ${dayPeriod} ${EASTERN_TIME_LABEL}`
}
