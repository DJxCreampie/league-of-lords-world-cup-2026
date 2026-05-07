import type { TeamStatus } from '../types'

export type NormalizedMatchStatus = 'upcoming' | 'live' | 'final' | 'postponed' | 'canceled'

export type NormalizedMatch = {
  matchId: string
  competitionId: string
  kickoffTime: string
  status: NormalizedMatchStatus
  minute: number | null
  homeTeamId: string
  awayTeamId: string
  homeTeamName: string
  awayTeamName: string
  homeGoals: number
  awayGoals: number
  winnerTeamId?: string
  rawSource?: unknown
}

export type NormalizedTeamStatus = {
  teamId: string
  teamName: string
  apiTeamId: string
  group: string
  goalsFor: number
  status: TeamStatus
  matchesPlayed: number
  lastUpdated: string
}
