import generatedData from '../data/normalized/generated-data.json'

type GeneratedTeam = {
  teamId?: string
  teamName?: string
  group?: string
  status?: string
}

type GeneratedMatch = {
  homeTeamId?: string
  awayTeamId?: string
  homeTeamName?: string
  awayTeamName?: string
}

const UNKNOWN_TEAM_PATTERN = /unknown home|unknown away/i

const isPlaceholderTeam = (id: string, name: string) => id.startsWith('unmapped:') || UNKNOWN_TEAM_PATTERN.test(name)

export type PoolTeam = {
  id: string
  name: string
  group?: string
  status?: string
}

export const deriveGeneratedTeamPool = (): { teams: PoolTeam[]; ignoredPlaceholders: Array<{ id: string; name: string }> } => {
  const pool = new Map<string, PoolTeam>()
  const ignoredPlaceholders = new Map<string, string>()

  const generatedTeams = ((generatedData as { teams?: GeneratedTeam[] }).teams ?? [])

  for (const team of generatedTeams) {
    const id = String(team.teamId ?? '')
    const name = String(team.teamName ?? '')
    if (!id) continue
    if (isPlaceholderTeam(id, name)) {
      ignoredPlaceholders.set(id, name || 'Unknown')
      continue
    }

    pool.set(id, {
      id,
      name: name || id,
      group: team.group,
      status: team.status,
    })
  }

  for (const match of (generatedData.matches ?? []) as GeneratedMatch[]) {
    for (const side of ['home', 'away'] as const) {
      const id = String(match[`${side}TeamId`] ?? '')
      const name = String(match[`${side}TeamName`] ?? '')
      if (!id) continue

      if (isPlaceholderTeam(id, name)) {
        ignoredPlaceholders.set(id, name || 'Unknown')
        continue
      }

      if (!pool.has(id)) {
        pool.set(id, { id, name: name || id })
      }
    }
  }

  return {
    teams: [...pool.values()].sort((a, b) => a.name.localeCompare(b.name)),
    ignoredPlaceholders: [...ignoredPlaceholders.entries()].map(([id, name]) => ({ id, name })),
  }
}

export const ASSIGNMENT_TEAM_ID_ALIASES: Record<string, string> = {
  'team-bosnia': 'team-bosnia-herzegovina',
  'team-congo': 'team-congo-dr',
}

export const normalizeAssignedTeamId = (teamId: string): string => ASSIGNMENT_TEAM_ID_ALIASES[teamId] ?? teamId
