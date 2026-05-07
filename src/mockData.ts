import managerSource from './data/assignments/managers.json'
import assignmentSource from './data/assignments/official-assignments.json'
import assignableTeams from './data/assignments/assignable-teams-2026.json'
import generatedData from './data/normalized/generated-data.json'
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

export const lastUpdated = 'May 7, 2026 at 12:00 PM ET'

export const managers: Manager[] = managerSource.map((manager) => ({
  id: manager.id,
  name: manager.displayName,
}))

const generatedTeamsById = new Map((generatedData.teams ?? []).map((team) => [team.teamId, team]))
const hasAnyFinishedMatches = (generatedData.matches ?? []).some((match) => match.status === 'final')

export const teams: Team[] = assignableTeams.map((team) => {
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
    group: team.group,
    goalsFor: hasAnyFinishedMatches ? Number(generated?.goalsFor ?? 0) : 0,
    knockoutGoals: 0,
    status: (hasAnyFinishedMatches ? (generated?.status ?? 'active') : 'active') as TeamStatus,
  }
})

export const assignments: Assignment[] = assignmentSource.flatMap((entry) =>
  entry.teamIds.map((teamId) => ({
    managerId: entry.managerId,
    teamId,
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
  stage: 'Group',
  status: statusMap[String(match.status)] ?? 'scheduled',
  kickoffTime: String(match.kickoffTime ?? ''),
  homeTeamId: String(match.homeTeamId),
  awayTeamId: String(match.awayTeamId),
  homeGoals: Number(match.homeGoals ?? 0),
  awayGoals: Number(match.awayGoals ?? 0),
}))

export const matchScoreOverrides: MatchScoreOverride[] = []
export const teamManualOverrides: TeamManualOverride[] = []
export const teamGoalAdjustments: TeamGoalAdjustment[] = []
