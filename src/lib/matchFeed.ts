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

export function formatMatchFeedScore(match: Pick<Match, 'status' | 'homeGoals' | 'awayGoals'>, homeTeamName = 'Unknown Home', awayTeamName = 'Unknown Away'): string {
  if (match.status === 'scheduled') return `Upcoming · ${homeTeamName} vs ${awayTeamName}`

  return `${match.status.toUpperCase()} · ${homeTeamName} ${match.homeGoals} - ${match.awayGoals} ${awayTeamName}`
}

export function formatPenaltyShootoutScore(match: Pick<Match, 'homePenaltyShootoutGoals' | 'awayPenaltyShootoutGoals'>, homeTeamName = 'Unknown Home', awayTeamName = 'Unknown Away'): string | null {
  if (match.homePenaltyShootoutGoals === undefined || match.awayPenaltyShootoutGoals === undefined) return null

  return `Penalties: ${homeTeamName} ${match.homePenaltyShootoutGoals} - ${match.awayPenaltyShootoutGoals} ${awayTeamName}`
}
