import type {
  Assignment,
  Manager,
  Match,
  MatchScoreOverride,
  Team,
  TeamGoalAdjustment,
} from './types'

export type ScoredTeam = Team & {
  goals: number
}

export type RankedManager = Manager & {
  teams: ScoredTeam[]
  totalGoals: number
  activeTeamsRemaining: number
}

function getMatchGoals(match: Match, matchScoreOverrides: MatchScoreOverride[]): Pick<Match, 'homeGoals' | 'awayGoals'> {
  const override = matchScoreOverrides.find((scoreOverride) => scoreOverride.matchId === match.id)

  return override ?? match
}

function getTeamGoalAdjustment(team: Team, teamGoalAdjustments: TeamGoalAdjustment[]): number {
  return teamGoalAdjustments
    .filter((adjustment) => adjustment.teamId === team.id)
    .reduce((total, adjustment) => total + adjustment.goals, 0)
}

export function getTeamGoals(
  team: Team,
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
): number {
  const matchGoals = matches.reduce((total, match) => {
    if (match.status === 'scheduled') {
      return total
    }

    const effectiveGoals = getMatchGoals(match, matchScoreOverrides)

    if (match.homeTeamId === team.id) {
      return total + effectiveGoals.homeGoals
    }

    if (match.awayTeamId === team.id) {
      return total + effectiveGoals.awayGoals
    }

    return total
  }, 0)

  return matchGoals + getTeamGoalAdjustment(team, teamGoalAdjustments)
}

export function getAssignedTeams(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
): ScoredTeam[] {
  const teamById = new Map(teams.map((team) => [team.id, team]))

  return assignments
    .filter((assignment) => assignment.managerId === manager.id)
    .map((assignment) => teamById.get(assignment.teamId))
    .filter((team): team is Team => team !== undefined)
    .map((team) => ({
      ...team,
      goals: getTeamGoals(team, matches, matchScoreOverrides, teamGoalAdjustments),
    }))
}

export function getManagerTotal(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
): number {
  return getAssignedTeams(
    manager,
    teams,
    assignments,
    matches,
    matchScoreOverrides,
    teamGoalAdjustments,
  ).reduce((sum, team) => sum + team.goals, 0)
}

export function getActiveTeamsRemaining(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
): number {
  return getAssignedTeams(
    manager,
    teams,
    assignments,
    matches,
    matchScoreOverrides,
    teamGoalAdjustments,
  ).filter((team) => team.status !== 'eliminated').length
}

export function rankManagers(
  managers: Manager[],
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
): RankedManager[] {
  return managers
    .map((manager) => {
      const assignedTeams = getAssignedTeams(
        manager,
        teams,
        assignments,
        matches,
        matchScoreOverrides,
        teamGoalAdjustments,
      )

      return {
        ...manager,
        teams: assignedTeams,
        totalGoals: assignedTeams.reduce((sum, team) => sum + team.goals, 0),
        activeTeamsRemaining: assignedTeams.filter((team) => team.status !== 'eliminated').length,
      }
    })
    .sort((a, b) => b.totalGoals - a.totalGoals)
}
