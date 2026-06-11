import type {
  Assignment,
  Manager,
  Match,
  MatchScoreOverride,
  Team,
  TeamGoalAdjustment,
  TeamManualOverride,
} from './types'

export type ScoredTeam = Team & { goals: number }

export type RankedManager = Manager & {
  teams: ScoredTeam[]
  totalGoals: number
  activeTeamsRemaining: number
  totalKnockoutGoals: number
}

function applyTeamOverrides(teams: Team[], teamManualOverrides: TeamManualOverride[] = []): Team[] {
  const overrideByTeamId = new Map(teamManualOverrides.map((override) => [override.teamId, override]))

  return teams.map((team) => {
    const override = overrideByTeamId.get(team.id)
    if (!override) return team

    return {
      ...team,
      status: override.status ?? team.status,
    }
  })
}

function getMatchGoals(match: Match, matchScoreOverrides: MatchScoreOverride[]): Pick<Match, 'homeGoals' | 'awayGoals'> {
  return matchScoreOverrides.find((scoreOverride) => scoreOverride.matchId === match.id) ?? match
}

function getTeamGoalAdjustment(team: Team, teamGoalAdjustments: TeamGoalAdjustment[]): number {
  return teamGoalAdjustments
    .filter((adjustment) => adjustment.teamId === team.id)
    .reduce((total, adjustment) => total + adjustment.goals, 0)
}

export function getTeamGoals(team: Team, matches: Match[], matchScoreOverrides: MatchScoreOverride[] = [], teamGoalAdjustments: TeamGoalAdjustment[] = []): number {
  const fromMatches = matches.reduce((total, match) => {
    if (match.status === 'scheduled') return total
    const effectiveGoals = getMatchGoals(match, matchScoreOverrides)
    if (match.homeTeamId === team.id) return total + effectiveGoals.homeGoals
    if (match.awayTeamId === team.id) return total + effectiveGoals.awayGoals
    return total
  }, 0)

  return fromMatches + getTeamGoalAdjustment(team, teamGoalAdjustments)
}

export function getAssignedTeams(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): ScoredTeam[] {
  const effectiveTeams = applyTeamOverrides(teams, teamManualOverrides)
  const teamById = new Map(effectiveTeams.map((team) => [team.id, team]))

  return assignments
    .filter((assignment) => assignment.managerId === manager.id)
    .map((assignment) => teamById.get(assignment.teamId))
    .filter((team): team is Team => team !== undefined)
    .map((team) => ({ ...team, goals: getTeamGoals(team, matches, matchScoreOverrides, teamGoalAdjustments) }))
}


export function getManagerTotal(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): number {
  return getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    .reduce((sum, team) => sum + team.goals, 0)
}

export function getActiveTeamsRemaining(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): number {
  return getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    .filter((team) => team.status === 'active' || team.status === 'champion').length
}

export function rankManagers(
  managers: Manager[], teams: Team[], assignments: Assignment[], matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [], teamGoalAdjustments: TeamGoalAdjustment[] = [], teamManualOverrides: TeamManualOverride[] = [],
): RankedManager[] {
  return managers.map((manager) => {
    const assignedTeams = getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    return {
      ...manager,
      teams: assignedTeams,
      totalGoals: assignedTeams.reduce((sum, team) => sum + team.goals, 0),
      activeTeamsRemaining: assignedTeams.filter((team) => team.status === 'active' || team.status === 'champion').length,
      totalKnockoutGoals: assignedTeams.reduce((sum, team) => sum + (team.knockoutGoals ?? 0), 0),
    }
  }).sort((a, b) => b.totalGoals - a.totalGoals
    || b.activeTeamsRemaining - a.activeTeamsRemaining
    || b.totalKnockoutGoals - a.totalKnockoutGoals
    || a.name.localeCompare(b.name))
}
