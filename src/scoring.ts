export type TeamStatus = 'active' | 'eliminated' | 'champion'

export type Team = {
  name: string
  goals: number
  status: TeamStatus
}

export type Manager = {
  name: string
  teams: Team[]
}

export type RankedManager = Manager & {
  totalGoals: number
}

export function getManagerTotal(manager: Manager): number {
  return manager.teams.reduce((sum, team) => sum + team.goals, 0)
}

export function rankManagers(managers: Manager[]): RankedManager[] {
  return managers
    .map((manager) => ({
      ...manager,
      totalGoals: getManagerTotal(manager),
    }))
    .sort((a, b) => b.totalGoals - a.totalGoals)
}
