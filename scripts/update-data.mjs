import fs from 'node:fs/promises'
import { TEAM_ID_BY_API_ID, TEAM_ID_BY_API_NAME } from '../src/data/mappings/teamMapping.js'

const outputPath = 'src/data/normalized/generated-data.json'
const sourceMode = process.env.DATA_SOURCE ?? 'football-data'

const FOOTBALL_DATA_BASE_URL = process.env.FOOTBALL_DATA_BASE_URL ?? 'https://api.football-data.org/v4'
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY
const FOOTBALL_DATA_COMPETITION_CODE = process.env.FOOTBALL_DATA_COMPETITION_CODE ?? 'WC'
const FOOTBALL_DATA_SEASON_YEAR = Number(process.env.FOOTBALL_DATA_SEASON_YEAR ?? '2026')

const normalizeStatus = (raw) => {
  switch (raw) {
    case 'SCHEDULED':
    case 'TIMED':
      return 'upcoming'
    case 'IN_PLAY':
    case 'PAUSED':
      return 'live'
    case 'FINISHED':
      return 'final'
    case 'POSTPONED':
    case 'SUSPENDED':
      return 'postponed'
    case 'CANCELED':
      return 'canceled'
    default:
      return 'unknown'
  }
}

const resolveTeamId = (apiId, name) => TEAM_ID_BY_API_ID[String(apiId)] ?? TEAM_ID_BY_API_NAME[String(name).toLowerCase()] ?? `unmapped:${apiId}`

const normalizeOptionalScoreNumber = (value) => {
  if (value === null || value === undefined) return undefined

  const score = Number(value)
  return Number.isFinite(score) ? score : undefined
}

const normalizeScoreNumber = (value) => normalizeOptionalScoreNumber(value) ?? 0

async function fetchFootballData(path) {
  if (!FOOTBALL_DATA_API_KEY) {
    throw new Error('Missing FOOTBALL_DATA_API_KEY for football-data mode')
  }

  const response = await fetch(`${FOOTBALL_DATA_BASE_URL}${path}`, {
    headers: {
      'X-Auth-Token': FOOTBALL_DATA_API_KEY,
      Accept: 'application/json',
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) throw new Error('football-data unauthorized (401): invalid/missing API key')
    if (response.status === 403) throw new Error('football-data forbidden (403): plan restriction')
    if (response.status === 429) throw new Error('football-data rate-limited (429): retry later')
    throw new Error(`football-data request failed (${response.status})`)
  }

  return payload
}

export function normalizeFootballDataMatch(match, competition) {
  const homeApiId = String(match?.homeTeam?.id ?? 'unknown-home')
  const awayApiId = String(match?.awayTeam?.id ?? 'unknown-away')
  const homeName = String(match?.homeTeam?.name ?? 'Unknown Home')
  const awayName = String(match?.awayTeam?.name ?? 'Unknown Away')
  const status = normalizeStatus(String(match?.status ?? ''))

  const homeTeamId = resolveTeamId(homeApiId, homeName)
  const awayTeamId = resolveTeamId(awayApiId, awayName)

  const homeGoals = normalizeScoreNumber(match?.score?.fullTime?.home)
  const awayGoals = normalizeScoreNumber(match?.score?.fullTime?.away)
  const homePenaltyShootoutGoals = normalizeOptionalScoreNumber(match?.score?.penalties?.home)
  const awayPenaltyShootoutGoals = normalizeOptionalScoreNumber(match?.score?.penalties?.away)

  const winner = match?.score?.winner
  const winnerTeamId = status === 'final'
    ? winner === 'HOME_TEAM'
      ? homeTeamId
      : winner === 'AWAY_TEAM'
        ? awayTeamId
        : undefined
    : undefined

  return {
    matchId: String(match?.id ?? ''),
    competitionId: String(match?.competition?.id ?? competition?.id ?? FOOTBALL_DATA_COMPETITION_CODE),
    competitionCode: String(match?.competition?.code ?? competition?.code ?? FOOTBALL_DATA_COMPETITION_CODE),
    competitionName: String(match?.competition?.name ?? competition?.name ?? 'Unknown Competition'),
    seasonYear: Number(match?.season?.startDate?.slice(0, 4) ?? FOOTBALL_DATA_SEASON_YEAR),
    kickoffTime: String(match?.utcDate ?? ''),
    status,
    matchday: match?.matchday ?? null,
    stage: match?.stage ?? null,
    group: match?.group ?? null,
    minute: null,
    homeTeamId,
    homeTeamName: homeName,
    awayTeamId,
    awayTeamName: awayName,
    homeGoals,
    awayGoals,
    ...(homePenaltyShootoutGoals === undefined ? {} : { homePenaltyShootoutGoals }),
    ...(awayPenaltyShootoutGoals === undefined ? {} : { awayPenaltyShootoutGoals }),
    winnerTeamId,
    sourceProvider: 'football-data.org',
    sourceStatus: String(match?.status ?? ''),
    lastUpdated: String(match?.lastUpdated ?? new Date().toISOString()),
  }
}

async function buildFromFootballData() {
  const competition = await fetchFootballData(`/competitions/${FOOTBALL_DATA_COMPETITION_CODE}`)
  const matchesPayload = await fetchFootballData(`/competitions/${FOOTBALL_DATA_COMPETITION_CODE}/matches?season=${FOOTBALL_DATA_SEASON_YEAR}`)

  if (!Array.isArray(matchesPayload?.matches)) {
    throw new Error('Unexpected football-data response shape: matches array missing')
  }

  if (matchesPayload.matches.length === 0) {
    console.warn('No matches returned from football-data for requested competition/season')
  }

  return {
    generatedAt: new Date().toISOString(),
    source: 'football-data.org',
    meta: {
      competitionCode: FOOTBALL_DATA_COMPETITION_CODE,
      seasonYear: FOOTBALL_DATA_SEASON_YEAR,
      scoreFreshness: 'free-tier may be delayed',
      liveMinuteAvailable: false,
      scoringSource: 'matches-only',
    },
    matches: matchesPayload.matches.map((match) => normalizeFootballDataMatch(match, competition)),
  }
}

if (sourceMode !== 'football-data') {
  throw new Error(`Unsupported DATA_SOURCE "${sourceMode}". Production refresh supports only football-data.`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const output = await buildFromFootballData()

  await fs.mkdir('src/data/normalized', { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
  console.log(`Updated ${outputPath} using source mode: ${sourceMode}`)
}
