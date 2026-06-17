import type { Match } from '../types'
import { getNewYorkDayKey, getTodayNewYorkDayKey } from './time'

export function getDefaultMatchFeedDay(now = new Date()): string {
  return getTodayNewYorkDayKey(now)
}

export function getMatchesForNewYorkDay<T extends Pick<Match, 'kickoffTime'>>(
  matches: T[],
  selectedDay: string | null,
): T[] {
  if (!selectedDay) return []

  return matches.filter((match) => getNewYorkDayKey(match.kickoffTime) === selectedDay)
}
