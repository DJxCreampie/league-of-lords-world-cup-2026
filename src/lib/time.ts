const NEW_YORK_TIME_ZONE = 'America/New_York'
const ET_LABEL = 'ET'

type DateParts = {
  year: string
  month: string
  day: string
}

function parseDate(value?: string): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getNewYorkDateParts(date: Date): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NEW_YORK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const valueByType = new Map(parts.map((part) => [part.type, part.value]))

  return {
    year: valueByType.get('year') ?? '0000',
    month: valueByType.get('month') ?? '00',
    day: valueByType.get('day') ?? '00',
  }
}

export function getNewYorkDayKey(value?: string): string | null {
  const date = parseDate(value)
  if (!date) return null

  const { year, month, day } = getNewYorkDateParts(date)
  return `${year}-${month}-${day}`
}

export function isOnNewYorkDay(value: string | undefined, dayKey: string): boolean {
  return getNewYorkDayKey(value) === dayKey
}

export function formatNewYorkDayLabel(dayKey: string | null): string {
  if (!dayKey) return 'No dated matches'

  const [year, month, day] = dayKey.split('-')
  if (!year || !month || !day) return 'No dated matches'

  return `${Number(month)}/${Number(day)}/${year}`
}

export function formatNewYorkDateTime(value?: string, fallback = 'Kickoff TBD'): string {
  const date = parseDate(value)
  if (!date) return fallback

  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: NEW_YORK_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${formatted} ${ET_LABEL}`
}
