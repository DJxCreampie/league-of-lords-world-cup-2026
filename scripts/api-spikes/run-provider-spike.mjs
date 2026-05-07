import fs from 'node:fs/promises'
import completed from '../../src/data/mock-api/completed-match.json' with { type: 'json' }
import standings from '../../src/data/mock-api/team-standings.json' with { type: 'json' }
import { PROVIDERS } from './provider-config.mjs'

const providerKey = process.argv[2] ?? 'footballData'
const useMock = !process.argv.includes('--live')
const provider = PROVIDERS[providerKey]

if (!provider) {
  throw new Error(`Unknown provider '${providerKey}'. Valid: ${Object.keys(PROVIDERS).join(', ')}`)
}

if (!useMock && !process.env[provider.keyEnv]) {
  throw new Error(`Missing ${provider.keyEnv}. Use mock mode (default) or set env key for live spike.`)
}

const normalized = {
  provider: provider.name,
  mode: useMock ? 'mock' : 'live-placeholder',
  generatedAt: new Date().toISOString(),
  matches: [
    {
      matchId: String(completed.fixture.id),
      competitionId: String(completed.fixture.competition),
      kickoffTime: String(completed.fixture.date),
      status: completed.fixture.status === 'FT' ? 'final' : 'upcoming',
      minute: completed.fixture.minute,
      homeTeamId: String(completed.teams.home.id),
      awayTeamId: String(completed.teams.away.id),
      homeTeamName: String(completed.teams.home.name),
      awayTeamName: String(completed.teams.away.name),
      homeGoals: Number(completed.goals.home ?? 0),
      awayGoals: Number(completed.goals.away ?? 0),
      winnerTeamId: Number(completed.goals.home ?? 0) > Number(completed.goals.away ?? 0)
        ? String(completed.teams.home.id)
        : String(completed.teams.away.id),
      rawSource: completed,
    },
  ],
  teams: standings.table.map((row) => ({
    teamId: String(row.apiTeamId),
    teamName: String(row.teamName),
    apiTeamId: String(row.apiTeamId),
    group: String(row.group ?? ''),
    goalsFor: Number(row.goalsFor ?? 0),
    status: ['active', 'eliminated', 'champion', 'unassigned'].includes(row.status) ? row.status : 'unassigned',
    matchesPlayed: Number(row.matchesPlayed ?? 0),
    lastUpdated: String(standings.updatedAt),
  })),
}

await fs.mkdir('src/data/spikes', { recursive: true })
const outputPath = `src/data/spikes/${providerKey}-normalized-sample.json`
await fs.writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`)
console.log(`Wrote ${outputPath}`)
console.log('Note: live mode is intentionally placeholder-only and not wired to a real provider yet.')
