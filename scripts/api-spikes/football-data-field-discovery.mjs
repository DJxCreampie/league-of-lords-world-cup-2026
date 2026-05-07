#!/usr/bin/env node

const BASE_URL = process.env.FOOTBALL_DATA_BASE_URL || 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY

const ENDPOINTS = [
  { key: 'competitions', path: '/competitions', label: 'Competitions list' },
  { key: 'worldCup', path: '/competitions/WC', label: 'World Cup competition details' },
  { key: 'worldCupMatches', path: '/competitions/WC/matches?limit=10', label: 'World Cup matches sample' },
  { key: 'fallbackMatches', path: '/competitions/PL/matches?limit=10', label: 'Fallback competition matches sample (Premier League)' }
]

function handleStatus(status, body = '') {
  if (status === 401) return 'Unauthorized (401): API key missing/invalid.'
  if (status === 403) return 'Forbidden (403): plan restriction or access denied for this endpoint.'
  if (status === 429) return 'Rate limited (429): retry later.'
  return `HTTP ${status}: ${String(body).slice(0, 180)}`
}

async function fetchEndpoint(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'X-Auth-Token': API_KEY,
      Accept: 'application/json'
    }
  })

  let payload = null
  let text = ''

  try {
    payload = await response.json()
  } catch {
    text = await response.text()
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      endpoint: path,
      error: handleStatus(response.status, text || JSON.stringify(payload))
    }
  }

  return {
    ok: true,
    status: response.status,
    endpoint: path,
    payload
  }
}

function yesNo(value) {
  return value ? 'yes' : 'no'
}

function fieldAvailability(match) {
  return {
    matchId: yesNo(match?.id != null),
    competition: yesNo(match?.competition?.id != null || match?.competition?.name || match?.competition?.code),
    season: yesNo(match?.season?.id != null || match?.season?.startDate || match?.season?.endDate),
    kickoffUtcDate: yesNo(Boolean(match?.utcDate)),
    status: yesNo(Boolean(match?.status)),
    matchday: yesNo(match?.matchday != null),
    stageGroupRound: yesNo(Boolean(match?.stage || match?.group || match?.round)),
    homeTeam: yesNo(match?.homeTeam?.id != null || match?.homeTeam?.name),
    awayTeam: yesNo(match?.awayTeam?.id != null || match?.awayTeam?.name),
    homeGoals: yesNo(match?.score?.fullTime?.home != null),
    awayGoals: yesNo(match?.score?.fullTime?.away != null),
    winner: yesNo(Boolean(match?.score?.winner)),
    liveMinute: yesNo(match?.minute != null || match?.score?.duration === 'LIVE'),
    lastUpdated: yesNo(Boolean(match?.lastUpdated))
  }
}

function printMatchReport(matches) {
  if (!Array.isArray(matches)) {
    console.log('  Unexpected response shape: matches field missing or not an array.')
    return
  }

  if (matches.length === 0) {
    console.log('  No matches returned for this endpoint.')
    return
  }

  const sample = matches[0]
  const fields = fieldAvailability(sample)
  const completed = matches.filter((m) => m?.status === 'FINISHED')
  const completedWithScores = completed.filter((m) => m?.score?.fullTime?.home != null && m?.score?.fullTime?.away != null)

  console.log('  Match field availability (sample match):')
  Object.entries(fields).forEach(([field, value]) => {
    console.log(`   - ${field}: ${value}`)
  })

  console.log(`  Scores included for completed matches: ${completed.length > 0 ? `${completedWithScores.length}/${completed.length}` : 'no completed matches in sample'}`)
  console.log(`  Live-minute style signal present: ${fields.liveMinute}`)
  console.log(`  Enough fields for cumulative team goals: ${fields.homeGoals === 'yes' && fields.awayGoals === 'yes' ? 'likely yes' : 'needs inference/extra endpoints'}`)
}

async function main() {
  if (!API_KEY) {
    console.error('Missing FOOTBALL_DATA_API_KEY. Set it in your environment before running discovery.')
    process.exit(1)
  }

  console.log('football-data.org field discovery report')
  console.log(`Base URL: ${BASE_URL}`)

  for (const endpoint of ENDPOINTS) {
    console.log(`\nEndpoint: ${endpoint.label}`)
    const result = await fetchEndpoint(endpoint.path)

    if (!result.ok) {
      console.log(`  success: no`)
      console.log(`  status: ${result.status}`)
      console.log(`  tested endpoint: ${result.endpoint}`)
      console.log(`  error: ${result.error}`)
      continue
    }

    const payload = result.payload
    const topLevelFields = payload && typeof payload === 'object' ? Object.keys(payload) : []

    console.log('  success: yes')
    console.log(`  status: ${result.status}`)
    console.log(`  tested endpoint: ${result.endpoint}`)
    console.log(`  top-level fields: ${topLevelFields.join(', ') || '(none)'}`)

    if (endpoint.key === 'worldCupMatches' || endpoint.key === 'fallbackMatches') {
      printMatchReport(payload?.matches)
    }
  }

  console.log('\nInterpretation notes:')
  console.log('- Free-tier live-vs-delayed behavior can only be confirmed with real-time requests during active matches.')
  console.log('- If team elimination/champion status is missing, we can infer it from stage progression + final results later.')
}

main().catch((error) => {
  console.error(`Unexpected failure: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
