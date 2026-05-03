import type { Assignment, Manager, Team } from './types'

export type RankedManager = Manager & {
  teams: Team[]
  totalGoals: number
  activeTeamsRemaining: number
}

export function getAssignedTeams(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
): Team[] {
  const teamById = new Map(teams.map((team) => [team.id, team]))

  return assignments
    .filter((assignment) => assignment.managerId === manager.id)
    .map((assignment) => teamById.get(assignment.teamId))
    .filter((team): team is Team => team !== undefined)
}

export function getManagerTotal(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
): number {
  return getAssignedTeams(manager, teams, assignments).reduce((sum, team) => sum + team.goals, 0)
}

export function getActiveTeamsRemaining(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
): number {
  return getAssignedTeams(manager, teams, assignments).filter((team) => team.status !== 'eliminated')
    .length
}

export function rankManagers(
  managers: Manager[],
  teams: Team[],
  assignments: Assignment[],
): RankedManager[] {
  return managers
    .map((manager) => {
      const assignedTeams = getAssignedTeams(manager, teams, assignments)

      return {
        ...manager,
        teams: assignedTeams,
        totalGoals: assignedTeams.reduce((sum, team) => sum + team.goals, 0),
        activeTeamsRemaining: assignedTeams.filter((team) => team.status !== 'eliminated').length,
      }
    })
    .sort((a, b) => b.totalGoals - a.totalGoals)
}
