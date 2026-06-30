import managerSource from './data/assignments/managers.json'
import assignmentSource from './data/assignments/official-assignments.json'
import generatedData from './data/normalized/generated-data.json'
import { deriveGeneratedTeamPool, normalizeAssignedTeamId } from './lib/teamPool'
import type {
  Assignment,
  Manager,
  Match,
  MatchScoreOverride,
  Team,
  TeamGoalAdjustment,
  TeamManualOverride,
  TeamStatus,
} from './types'

export const lastUpdated = generatedData.generatedAt

export const dataDiagnostics = {
  source: String(generatedData.source ?? 'unknown'),
  generatedAt: String(generatedData.generatedAt ?? 'unknown'),
  totalMatchesLoaded: (generatedData.matches ?? []).length,
  countedMatches: (generatedData.matches ?? []).filter((match) =>
    match.status === 'final' || match.status === 'live',
  ).length,
}

export const managers: Manager[] = managerSource.map((manager) => ({
  id: manager.id,
  name: manager.displayName,
}))

const { teams: derivedPool } = deriveGeneratedTeamPool()
const generatedTeams = ((generatedData as { teams?: Array<{ teamId: string; group?: string; status?: TeamStatus }> }).teams ?? [])
const generatedTeamsById = new Map(generatedTeams.map((team) => [team.teamId, team]))

export const teams: Team[] = derivedPool.map((team) => {
  const generated = generatedTeamsById.get(team.id)
  return {
    id: team.id,
    name: team.name,
    shortName: team.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase(),
    group: team.group ?? generated?.group,
    goalsFor: 0,
    knockoutGoals: 0,
    status: 'active' as TeamStatus,
  }
})

export const assignments: Assignment[] = assignmentSource.flatMap((entry) =>
  entry.teamIds.map((teamId) => ({
    managerId: entry.managerId,
    teamId: normalizeAssignedTeamId(teamId),
  })),
)

const statusMap: Record<string, Match['status']> = {
  upcoming: 'scheduled',
  live: 'live',
  final: 'finished',
}

const generatedMatches = (generatedData.matches ?? []) as Array<Record<string, unknown>>

export const matches: Match[] = generatedMatches.map((match) => ({
  id: String(match.matchId),
  stage: String(match.stage ?? 'GROUP_STAGE'),
  status: statusMap[String(match.status)] ?? 'scheduled',
  kickoffTime: String(match.kickoffTime ?? ''),
  homeTeamId: String(match.homeTeamId),
  awayTeamId: String(match.awayTeamId),
  homeGoals: Number(match.homeGoals ?? 0),
  awayGoals: Number(match.awayGoals ?? 0),
  homePenaltyShootoutGoals: match.homePenaltyShootoutGoals === undefined ? undefined : Number(match.homePenaltyShootoutGoals),
  awayPenaltyShootoutGoals: match.awayPenaltyShootoutGoals === undefined ? undefined : Number(match.awayPenaltyShootoutGoals),
}))

export const matchScoreOverrides: MatchScoreOverride[] = []
export const teamManualOverrides: TeamManualOverride[] = []
export const teamGoalAdjustments: TeamGoalAdjustment[] = []
