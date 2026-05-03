import type { Assignment, Manager, Match, Team } from './types'

export type ScoredTeam = Team & {
  goals: number
}

export type RankedManager = Manager & {
  teams: ScoredTeam[]
  totalGoals: number
  activeTeamsRemaining: number
}

export function getTeamGoals(team: Team, matches: Match[]): number {
  return matches.reduce((total, match) => {
    if (match.status === 'scheduled') {
      return total
    }

    if (match.homeTeamId === team.id) {
      return total + match.homeGoals
    }

    if (match.awayTeamId === team.id) {
      return total + match.awayGoals
    }

    return total
  }, 0)
}

export function getAssignedTeams(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
): ScoredTeam[] {
  const teamById = new Map(teams.map((team) => [team.id, team]))

  return assignments
    .filter((assignment) => assignment.managerId === manager.id)
    .map((assignment) => teamById.get(assignment.teamId))
    .filter((team): team is Team => team !== undefined)
    .map((team) => ({
      ...team,
      goals: getTeamGoals(team, matches),
    }))
}

export function getManagerTotal(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
): number {
  return getAssignedTeams(manager, teams, assignments, matches).reduce(
    (sum, team) => sum + team.goals,
    0,
  )
}

export function getActiveTeamsRemaining(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
): number {
  return getAssignedTeams(manager, teams, assignments, matches).filter(
    (team) => team.status !== 'eliminated',
  ).length
}

export function rankManagers(
  managers: Manager[],
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
): RankedManager[] {
  return managers
    .map((manager) => {
      const assignedTeams = getAssignedTeams(manager, teams, assignments, matches)

      return {
        ...manager,
        teams: assignedTeams,
        totalGoals: assignedTeams.reduce((sum, team) => sum + team.goals, 0),
        activeTeamsRemaining: assignedTeams.filter((team) => team.status !== 'eliminated').length,
      }
    })
    .sort((a, b) => b.totalGoals - a.totalGoals)
}
