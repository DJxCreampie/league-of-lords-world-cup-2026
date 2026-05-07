import { TEAM_ID_BY_API_ID, TEAM_ID_BY_API_NAME } from '../data/mappings/teamMapping'
import type { TeamStatus } from '../types'
import type { NormalizedMatch, NormalizedMatchStatus, NormalizedTeamStatus } from './normalizedData'

// TODO(real-api): Expand this status translation once a provider is selected.
function normalizeStatus(raw: string): NormalizedMatchStatus {
  if (raw === 'NS') return 'upcoming'
  if (raw === 'LIVE') return 'live'
  if (raw === 'FT') return 'final'
  if (raw === 'PST') return 'postponed'
  return 'canceled'
}

// TODO(real-api): Keep team mappings in sync with provider IDs/naming conventions.
function resolveTeamId(apiTeamId: string, apiTeamName: string): string {
  const byId = TEAM_ID_BY_API_ID[apiTeamId]
  if (byId) return byId

  const byName = TEAM_ID_BY_API_NAME[apiTeamName.toLowerCase()]
  if (byName) return byName

  throw new Error(`Missing team mapping for API team: ${apiTeamId} / ${apiTeamName}`)
}

// TODO(real-api): Replace `raw: any` with provider-specific types once API contract is finalized.
export function normalizeMatchResponse(raw: any): NormalizedMatch {
  if (!raw?.fixture?.id || !raw?.teams?.home || !raw?.teams?.away) {
    throw new Error('Malformed match payload')
  }

  const homeTeamId = resolveTeamId(raw.teams.home.id, raw.teams.home.name)
  const awayTeamId = resolveTeamId(raw.teams.away.id, raw.teams.away.name)
  const status = normalizeStatus(raw.fixture.status)
  const homeGoals = Number(raw.goals?.home ?? 0)
  const awayGoals = Number(raw.goals?.away ?? 0)

  return {
    matchId: String(raw.fixture.id),
    competitionId: String(raw.fixture.competition ?? 'unknown-competition'),
    kickoffTime: String(raw.fixture.date),
    status,
    minute: raw.fixture.minute == null ? null : Number(raw.fixture.minute),
    homeTeamId,
    awayTeamId,
    homeTeamName: String(raw.teams.home.name),
    awayTeamName: String(raw.teams.away.name),
    homeGoals,
    awayGoals,
    winnerTeamId: status === 'final' ? (homeGoals === awayGoals ? undefined : (homeGoals > awayGoals ? homeTeamId : awayTeamId)) : undefined,
    rawSource: raw,
  }
}

export function normalizeTeamStandingsResponse(raw: any): NormalizedTeamStatus[] {
  if (!Array.isArray(raw?.table)) {
    throw new Error('Malformed team standings payload')
  }

  return raw.table.map((row: any) => {
    const teamId = resolveTeamId(String(row.apiTeamId), String(row.teamName))
    const normalizedStatus: TeamStatus = ['active', 'eliminated', 'champion', 'unassigned'].includes(row.status)
      ? row.status
      : 'unassigned'

    return {
      teamId,
      teamName: String(row.teamName),
      apiTeamId: String(row.apiTeamId),
      group: String(row.group ?? ''),
      goalsFor: Number(row.goalsFor ?? 0),
      status: normalizedStatus,
      matchesPlayed: Number(row.matchesPlayed ?? 0),
      lastUpdated: String(raw.updatedAt ?? new Date().toISOString()),
    }
  })
}
