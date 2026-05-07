import fs from 'node:fs/promises'
import upcoming from '../src/data/mock-api/upcoming-match.json' with { type: 'json' }
import live from '../src/data/mock-api/live-match.json' with { type: 'json' }
import completed from '../src/data/mock-api/completed-match.json' with { type: 'json' }
import standings from '../src/data/mock-api/team-standings.json' with { type: 'json' }
import { TEAM_ID_BY_API_ID, TEAM_ID_BY_API_NAME } from '../src/data/mappings/teamMapping.js'

const toStatus = (raw) => (raw === 'NS' ? 'upcoming' : raw === 'LIVE' ? 'live' : raw === 'FT' ? 'final' : raw === 'PST' ? 'postponed' : 'canceled')

const resolveTeamId = (apiId, name) => TEAM_ID_BY_API_ID[apiId] ?? TEAM_ID_BY_API_NAME[String(name).toLowerCase()] ?? `unmapped:${apiId}`

const normalizeMatch = (raw) => {
  const homeTeamId = resolveTeamId(raw.teams.home.id, raw.teams.home.name)
  const awayTeamId = resolveTeamId(raw.teams.away.id, raw.teams.away.name)
  const homeGoals = Number(raw.goals?.home ?? 0)
  const awayGoals = Number(raw.goals?.away ?? 0)
  const status = toStatus(raw.fixture.status)
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
    winnerTeamId: status === 'final' ? (homeGoals > awayGoals ? homeTeamId : awayGoals > homeGoals ? awayTeamId : undefined) : undefined,
  }
}

const normalizeTeam = (row, updatedAt) => ({
  teamId: resolveTeamId(String(row.apiTeamId), String(row.teamName)),
  teamName: String(row.teamName),
  apiTeamId: String(row.apiTeamId),
  group: String(row.group ?? ''),
  goalsFor: Number(row.goalsFor ?? 0),
  status: ['active', 'eliminated', 'champion', 'unassigned'].includes(row.status) ? row.status : 'unassigned',
  matchesPlayed: Number(row.matchesPlayed ?? 0),
  lastUpdated: String(updatedAt),
})

const output = {
  generatedAt: new Date().toISOString(),
  source: 'mock-api',
  matches: [upcoming, live, completed].map(normalizeMatch),
  teams: standings.table.map((row) => normalizeTeam(row, standings.updatedAt ?? new Date().toISOString())),
}

await fs.mkdir('src/data/normalized', { recursive: true })
await fs.writeFile('src/data/normalized/generated-data.json', `${JSON.stringify(output, null, 2)}\n`)
console.log('Updated src/data/normalized/generated-data.json')
